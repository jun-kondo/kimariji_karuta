import inquirer from "inquirer";
import { shuffleArray } from "../utils/randomizer.js";

export class KarutaQuiz {
  // 定数をクラス内で定義
  static PROPERTY_KEYS = {
    KIMARI_JI: "kimari-ji",
    KAMINO_KU: "kamino-ku",
    SHIMONO_KU: "shimono-ku",
    NUMBER: "number",
    POET: "poet",
    ID: "id",
  };

  static RANGE_OPTIONS = {
    ALL: { start: 1, end: 100, name: "全100首" },
    FIRST_QUARTER: { start: 1, end: 25, name: "1-25首" },
    SECOND_QUARTER: { start: 26, end: 50, name: "26-50首" },
    THIRD_QUARTER: { start: 51, end: 75, name: "51-75首" },
    FOURTH_QUARTER: { start: 76, end: 100, name: "76-100首" },
  };

  constructor(karutaData) {
    this.karutaData = karutaData;
    this.currentRange = KarutaQuiz.RANGE_OPTIONS.ALL; // デフォルトは全範囲
  }

  // 出題範囲を設定するメソッドを追加
  setRange(range) {
    this.currentRange = range;
  }

  // 出題範囲でフィルタリングするメソッドを追加
  getFilteredKarutaData() {
    return this.karutaData.filter(
      (poem) =>
        poem[KarutaQuiz.PROPERTY_KEYS.NUMBER] >= this.currentRange.start &&
        poem[KarutaQuiz.PROPERTY_KEYS.NUMBER] <= this.currentRange.end
    );
  }

  selectRandomPoems(count) {
    const filteredData = this.getFilteredKarutaData();
    return shuffleArray(filteredData).slice(0, count);
  }

  generateChoices(correctPoem, choiceCount = 3) {
    const { SHIMONO_KU, ID } = KarutaQuiz.PROPERTY_KEYS;
    const choices = [correctPoem[SHIMONO_KU]];

    const otherPoems = this.karutaData.filter(
      (poem) => poem[ID] !== correctPoem[ID]
    );
    const wrongChoices = shuffleArray(otherPoems)
      .slice(0, choiceCount - 1)
      .map((poem) => poem[SHIMONO_KU]);

    return shuffleArray([...choices, ...wrongChoices]);
  }

  createQuestion(poem, choiceCount = 3) {
    const { KIMARI_JI, SHIMONO_KU } = KarutaQuiz.PROPERTY_KEYS;
    return {
      kimariJi: poem[KIMARI_JI],
      correctAnswer: poem[SHIMONO_KU],
      choices: this.generateChoices(poem, choiceCount),
      fullPoem: poem,
    };
  }

  // 問題表示用のフォーマット関数を追加
  formatPoemDisplay(poem) {
    const { NUMBER, KAMINO_KU, SHIMONO_KU, POET } = KarutaQuiz.PROPERTY_KEYS;
    return [
      "----------------------------------------",
      "\n【和歌全文】",
      `歌番号: ${poem[NUMBER]}`,
      `上の句: ${poem[KAMINO_KU]}`,
      `下の句: ${poem[SHIMONO_KU]}`,
      `作者: ${poem[POET]}\n`,
      "----------------------------------------\n",
    ].join("\n");
  }

  async displayChoicesAndGetAnswer(question, index) {
    console.log(`\n問題 ${index + 1}:`);
    console.log(`決まり字: ${question.kimariJi}\n`);

    let isHintVisible = false;

    while (true) {
      if (isHintVisible) {
        console.log(
          `\nヒント: ${question.fullPoem[KarutaQuiz.PROPERTY_KEYS.KAMINO_KU]}\n`
        );
      }

      const answer = await inquirer.prompt([
        {
          type: "list",
          name: "selected",
          message: "下の句を選んでください:",
          choices: [
            ...question.choices.map((choice, i) => ({
              name: `${i + 1}) ${choice}`,
              value: choice,
            })),
            new inquirer.Separator(),
            {
              name: isHintVisible ? "上の句を隠す" : "上の句を表示する",
              value: "HINT",
            },
          ],
        },
      ]);

      if (answer.selected === "HINT") {
        isHintVisible = !isHintVisible; // ヒントの表示状態を切り替え
        continue;
      }

      return answer.selected;
    }
  }

  async start(questionCount = 3, choiceCount = 3) {
    console.log("百人一首クイズへようこそ！");

    // 出題範囲の選択を追加
    const rangeSelection = await inquirer.prompt([
      {
        type: "list",
        name: "range",
        message: "出題範囲を選択してください:",
        choices: Object.values(KarutaQuiz.RANGE_OPTIONS).map((range) => ({
          name: range.name,
          value: range,
        })),
      },
    ]);

    this.setRange(rangeSelection.range);
    console.log(`\n${rangeSelection.range.name}から出題します。\n`);

    const questions = this.selectRandomPoems(questionCount).map((poem) =>
      this.createQuestion(poem, choiceCount)
    );

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswer = await this.displayChoicesAndGetAnswer(question, i);
      const isCorrect = userAnswer === question.correctAnswer;

      console.log(isCorrect ? "\n正解！" : "\n不正解...");
      console.log(this.formatPoemDisplay(question.fullPoem));
    }
  }
}
