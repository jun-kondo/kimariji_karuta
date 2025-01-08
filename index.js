import inquirer from 'inquirer';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 現在のファイルのディレクトリパスを取得
const __dirname = dirname(fileURLToPath(import.meta.url));

class KarutaQuiz {
    constructor(karutaData) {
        this.karutaData = karutaData;
    }

    // ランダムに和歌を選択
    selectRandomPoems(count) {
        const shuffled = [...this.karutaData].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // 選択肢を生成
    generateChoices(correctPoem) {
        const choices = [correctPoem.shimono_ku];
        const otherPoems = this.karutaData.filter(poem => poem.id !== correctPoem.id);
        const wrongChoices = otherPoems
            .sort(() => 0.5 - Math.random())
            .slice(0, 2)
            .map(poem => poem.shimono_ku);
        
        return [...choices, ...wrongChoices].sort(() => 0.5 - Math.random());
    }

    // 問題を作成
    createQuestion(poem) {
        return {
            kimariJi: poem.kimari_ji,
            correctAnswer: poem.shimono_ku,
            choices: this.generateChoices(poem),
            fullPoem: {
                kaminoKu: poem.kamino_ku,
                shimonoKu: poem.shimono_ku,
                poet: poem.poet
            }
        };
    }

    // 選択肢を表示して回答を受け付ける
    async displayChoicesAndGetAnswer(question, index) {
        console.log(`\n問題 ${index + 1}:`);
        console.log(`決まり字: ${question.kimariJi}\n`);
        
        const answer = await inquirer.prompt([{
            type: 'list',
            name: 'selected',
            message: '下の句を選んでください:',
            choices: question.choices.map((choice, i) => ({
                name: `${i + 1}) ${choice}`,
                value: choice
            }))
        }]);
        
        return answer.selected;
    }

    // クイズを実行
    async start(questionCount = 3) {
        console.log('百人一首クイズへようこそ！');
        
        const selectedPoems = this.selectRandomPoems(questionCount);
        const questions = selectedPoems.map(poem => this.createQuestion(poem));
        
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const userAnswer = await this.displayChoicesAndGetAnswer(question, i);
            
            const isCorrect = userAnswer === question.correctAnswer;
            console.log(isCorrect ? '\n正解！' : '\n不正解...');
            
            console.log('\n【和歌全文】');
            console.log(question.fullPoem.kaminoKu);
            console.log(question.fullPoem.shimonoKu);
            console.log(`作者: ${question.fullPoem.poet}\n`);
        }
    }
}

// メイン処理
async function main() {
    const karutaData = JSON.parse(
        await readFile(join(__dirname, './karuta_data.json'), 'utf8')
    );
    
    const quiz = new KarutaQuiz(karutaData);
    await quiz.start();
}

main().catch(console.error);
