import inquirer from "inquirer";
import { shuffleArray } from "../utils/randomizer.js";
import { PROPERTY_KEYS, RANGE_OPTIONS } from "../constants/karutaConstants.js";

export class KarutaQuiz {
  constructor(karutaData) {
    this.karutaData = karutaData;
    this.currentRange = RANGE_OPTIONS.ALL;
  }

  async start(questionCount = 3, choiceCount = 3) {
    console.log("百人一首クイズへようこそ！");

    const rangeSelection = await this.selectQuizRange();
    this.setRange(rangeSelection.range);
    console.log(`\n${rangeSelection.range.name}から出題します。\n`);

    const questions = this.generateQuestions(questionCount, choiceCount);
    await this.conductQuiz(questions);
  }

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

  async conductQuiz(questions) {
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswer = await this.displayChoicesAndGetAnswer(question, i);
      const isCorrect = userAnswer === question.correctAnswer;
      this.displayQuizResult(isCorrect, question);
    }
  }

  generateQuestions(questionCount, choiceCount) {
    return this.selectRandomPoems(questionCount).map((poem) =>
      this.createQuestion(poem, choiceCount)
    );
  }

  selectRandomPoems(count) {
    const filteredData = this.getFilteredKarutaData();
    return shuffleArray(filteredData).slice(0, count);
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

  async displayChoicesAndGetAnswer(question, index) {
    this.displayQuestionHeader(index, question);
    return await this.handleAnswerSelection(question);
  }

  displayQuestionHeader(index, question) {
    console.log(`\n問題 ${index + 1}:`);
    console.log(`決まり字: ${question.kimariJi}\n`);
  }

  displayHint(question) {
    console.log(`\nヒント: ${question.fullPoem[PROPERTY_KEYS.KAMINO_KU]}\n`);
  }

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

  setRange(range) {
    this.currentRange = range;
  }

  getFilteredKarutaData() {
    return this.karutaData.filter(
      (poem) =>
        poem[PROPERTY_KEYS.NUMBER] >= this.currentRange.start &&
        poem[PROPERTY_KEYS.NUMBER] <= this.currentRange.end
    );
  }

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

  displayQuizResult(isCorrect, question) {
    console.log(isCorrect ? "\n正解！" : "\n不正解...");
    console.log(this.formatPoemDisplay(question.fullPoem));
  }
}
