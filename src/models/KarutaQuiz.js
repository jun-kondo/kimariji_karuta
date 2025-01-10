import inquirer from "inquirer";
import { shuffleArray } from "../utils/randomizer.js";
import { PROPERTY_KEYS, RANGE_OPTIONS } from "../constants/karutaConstants.js";

export class KarutaQuiz {
  constructor(karutaData) {
    this.karutaData = karutaData;
    this.currentRange = RANGE_OPTIONS.ALL; // デフォルトは全範囲
  }

  // 出題範囲を設定するメソッド
  setRange(range) {
    this.currentRange = range;
  }

  // 出題範囲でフィルタリングするメソッド
  getFilteredKarutaData() {
    return this.karutaData.filter(
      (poem) =>
        poem[PROPERTY_KEYS.NUMBER] >= this.currentRange.start &&
        poem[PROPERTY_KEYS.NUMBER] <= this.currentRange.end
    );
  }

  selectRandomPoems(count) {
    const filteredData = this.getFilteredKarutaData();
    return shuffleArray(filteredData).slice(0, count);
  }

  generateChoices(correctPoem, choiceCount = 3) {
    const { SHIMONO_KU, ID } = PROPERTY_KEYS;
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
    const { KIMARI_JI, SHIMONO_KU } = PROPERTY_KEYS;
    return {
      kimariJi: poem[KIMARI_JI],
      correctAnswer: poem[SHIMONO_KU],
      choices: this.generateChoices(poem, choiceCount),
      fullPoem: poem,
    };
  }

  // 問題表示用のフォーマット関数を追加
  formatPoemDisplay(poem) {
    const { NUMBER, KAMINO_KU, SHIMONO_KU, POET } = PROPERTY_KEYS;
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
    this.displayQuestionHeader(index, question);
    return await this.handleAnswerSelection(question);
  }

  // 問題のヘッダー表示を担当
  displayQuestionHeader(index, question) {
    console.log(`\n問題 ${index + 1}:`);
    console.log(`決まり字: ${question.kimariJi}\n`);
  }

  // ヒントの表示を担当
  displayHint(question) {
    console.log(`\nヒント: ${question.fullPoem[PROPERTY_KEYS.KAMINO_KU]}\n`);
  }

  // 選択肢の生成を担当
  createChoicesList(question, isHintVisible) {
    return [
      ...question.choices.map((choice, i) => ({
        name: `${i + 1}) ${choice}`,
        value: choice,
      })),
      new inquirer.Separator(),
      {
        name: isHintVisible ? "上の句を隠す" : "上の句を表示する",
        value: "HINT",
      },
    ];
  }

  // ユーザーの回答取得を担当
  async promptForAnswer(choices) {
    const { selected } = await inquirer.prompt([
      {
        type: "list",
        name: "selected",
        message: "下の句を選んでください:",
        choices,
      },
    ]);
    return selected;
  }

  // 回答選択の処理を担当
  async handleAnswerSelection(question) {
    let isHintVisible = false;

    while (true) {
      if (isHintVisible) {
        this.displayHint(question);
      }

      const choices = this.createChoicesList(question, isHintVisible);
      const answer = await this.promptForAnswer(choices);

      if (answer === "HINT") {
        isHintVisible = !isHintVisible;
        continue;
      }

      return answer;
    }
  }

  async start(questionCount = 3, choiceCount = 3) {
    // 初期メッセージの表示
    console.log("百人一首クイズへようこそ！");

    // 出題範囲の選択
    const rangeSelection = await this.selectQuizRange();
    this.setRange(rangeSelection.range);
    console.log(`\n${rangeSelection.range.name}から出題します。\n`);

    // 問題の生成と出題
    const questions = this.generateQuestions(questionCount, choiceCount);
    await this.conductQuiz(questions);
  }

  // 出題範囲選択用のメソッド
  async selectQuizRange() {
    return await inquirer.prompt([
      {
        type: "list",
        name: "range",
        message: "出題範囲を選択してください:",
        choices: Object.values(RANGE_OPTIONS).map((range) => ({
          name: range.name,
          value: range,
        })),
      },
    ]);
  }

  // 問題セットの生成
  generateQuestions(questionCount, choiceCount) {
    return this.selectRandomPoems(questionCount).map((poem) =>
      this.createQuestion(poem, choiceCount)
    );
  }

  // クイズの実施
  async conductQuiz(questions) {
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      // ユーザーからの回答を取得
      const userAnswer = await this.displayChoicesAndGetAnswer(question, i);

      // 正誤判定と結果表示
      const isCorrect = userAnswer === question.correctAnswer;
      this.displayQuizResult(isCorrect, question);
    }
  }

  // クイズ結果の表示
  displayQuizResult(isCorrect, question) {
    console.log(isCorrect ? "\n正解！" : "\n不正解...");
    console.log(this.formatPoemDisplay(question.fullPoem));
  }
}
