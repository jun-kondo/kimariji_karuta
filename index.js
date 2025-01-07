const karutaData = require('./karuta_data.json');
// const readlineSync = require('readline-sync');

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

// メイン関数
function main() {
    console.log('百人一首クイズへようこそ！');
    
    // 3つの和歌を選択して問題を作成
    const selectedPoems = selectRandomPoems(3);
    const questions = selectedPoems.map(poem => createQuestion(poem));
    
    // 動作確認用に問題を表示
    questions.forEach((q, index) => {
        console.log(`\n問題 ${index + 1}:`);
        console.log(`決まり字: ${q.kimariJi}`);
        console.log('選択肢:');
        q.choices.forEach((choice, i) => {
            console.log(`${i + 1}. ${choice}`);
        });
    });
}

main();
