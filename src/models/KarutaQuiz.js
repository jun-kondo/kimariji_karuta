import inquirer from 'inquirer';
import { shuffleArray } from '../utils/randomizer.js';

export class KarutaQuiz {
    constructor(karutaData) {
        this.karutaData = karutaData;
    }

    // ランダムに和歌を選択
    selectRandomPoems(count) {
        return shuffleArray(this.karutaData).slice(0, count);
    }

    // 選択肢を生成
    generateChoices(correctPoem, choiceCount = 3) {
        const choices = [correctPoem.shimono_ku];
        const otherPoems = this.karutaData.filter(poem => poem.id !== correctPoem.id);
        const wrongChoices = shuffleArray(otherPoems)
            .slice(0, choiceCount - 1)
            .map(poem => poem.shimono_ku);
        
        return shuffleArray([...choices, ...wrongChoices]);
    }

    // 問題を作成
    createQuestion(poem, choiceCount = 3) {
        return {
            kimariJi: poem.kimari_ji,
            correctAnswer: poem.shimono_ku,
            choices: this.generateChoices(poem, choiceCount),
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
    async start(questionCount = 3, choiceCount = 3) {
        console.log('百人一首クイズへようこそ！');
        
        const selectedPoems = this.selectRandomPoems(questionCount);
        const questions = selectedPoems.map(poem => 
            this.createQuestion(poem, choiceCount)
        );
        
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