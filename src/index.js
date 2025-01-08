import { KarutaQuiz } from './models/KarutaQuiz.js';
import { loadKarutaData } from './utils/fileLoader.js';

async function main() {
    const karutaData = await loadKarutaData();
    const quiz = new KarutaQuiz(karutaData);
    
    // 問題数3問、選択肢4つの場合
    await quiz.start(3, 4);
    
    // または、デフォルトの3問、3択の場合
    // await quiz.start();
}

main().catch(console.error); 