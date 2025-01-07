// JSONデータを読み込む
const karutaData = require('./karuta-data.json');

// ランダムに指定された数の和歌を選択する関数
function selectRandomPoems(count) {
    // 配列をシャッフル
    const shuffled = [...karutaData].sort(() => 0.5 - Math.random());
    // 指定された数だけ返す
    return shuffled.slice(0, count);
}

// メイン関数
function main() {
    console.log('百人一首クイズへようこそ！');
    
    // 3つの和歌を選択
    const selectedPoems = selectRandomPoems(3);
    console.log('選択された和歌:', selectedPoems);
}

main();
