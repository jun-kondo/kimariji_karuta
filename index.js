const karutaData = require('./karuta_data.json');
const { default: inquirer } = require('inquirer');

// ランダムに指定された数の和歌を選択する関数
function selectRandomPoems(count) {
    // 配列をシャッフル
    const shuffled = [...karutaData].sort(() => 0.5 - Math.random());
    // 指定された数だけ返す
    return shuffled.slice(0, count);
}

// 選択肢を生成する関数
function generateChoices(correctPoem, allPoems) {
    // 正解の下の句を含める
    const choices = [correctPoem.shimono_ku];
    
    // 正解以外の和歌から2つランダムに選ぶ
    const otherPoems = allPoems.filter(poem => poem.id !== correctPoem.id);
    const wrongChoices = otherPoems
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map(poem => poem.shimono_ku);
    
    // 選択肢を結合してシャッフル
    return [...choices, ...wrongChoices].sort(() => 0.5 - Math.random());
}

// 問題を作成する関数
function createQuestion(poem) {
    return {
        kimariJi: poem.kimari_ji,
        correctAnswer: poem.shimono_ku,
        choices: generateChoices(poem, karutaData),
        fullPoem: {
            kaminoKu: poem.kamino_ku,
            shimonoKu: poem.shimono_ku,
            poet: poem.poet
        }
    };
}

// 選択肢を表示してユーザーの入力を受け付ける関数を非同期関数に変更
async function displayChoicesAndGetAnswer(question, index) {
    console.log(`\n問題 ${index + 1}:`);
    console.log(`決まり字: ${question.kimariJi}\n`);
    
    // inquirerを使用して選択肢を表示
    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'selected',
            message: '下の句を選んでください:',
            choices: question.choices.map((choice, i) => ({
                name: `${i + 1}) ${choice}`,
                value: choice
            }))
        }
    ]);
    
    return answer.selected;
}

// メイン関数も非同期関数に変更
async function main() {
    console.log('百人一首クイズへようこそ！');
    
    const selectedPoems = selectRandomPoems(3);
    const questions = selectedPoems.map(poem => createQuestion(poem));
    
    // 各問題について選択肢を表示し、回答を受け付ける
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswer = await displayChoicesAndGetAnswer(question, i);
        
        // 正誤判定
        const isCorrect = userAnswer === question.correctAnswer;
        console.log(isCorrect ? '\n正解！' : '\n不正解...');
        
        // 和歌の全文と作者を表示
        console.log('\n【和歌全文】');
        console.log(question.fullPoem.kaminoKu);
        console.log(question.fullPoem.shimonoKu);
        console.log(`作者: ${question.fullPoem.poet}\n`);
    }
}

// メイン関数の呼び出しを非同期に対応
main().catch(console.error);
