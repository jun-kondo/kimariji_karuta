import inquirer from "inquirer";
import { POEM_PROPERTY_KEYS, POEM_RANGES } from "../constants/constants.js";

export class KarutaQuiz {
  constructor(poemData) {
    this.poemData = poemData;
    this.currentRange = POEM_RANGES.ALL;
  }

  async startQuiz(questionCount = 3, choiceCount = 3) {
    const rangeSelection = await this.selectPoemsRange();
    this.currentRange = rangeSelection.range;

    console.log(`\n${rangeSelection.range.name}から出題します。\n`);
    const questions = this.generateQuestions(questionCount, choiceCount);
    await this.conductQuiz(questions);
  }

  async selectPoemsRange() {
    return inquirer.prompt([
      {
        type: "list",
        name: "range",
        message: "出題範囲を選択してください:",
        choices: Object.values(POEM_RANGES).map((range) => ({
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
      this.generateQuestion(poem, choiceCount),
    );
  }

  selectRandomPoems(count) {
    const filteredPoems = this.filterPoemsByNumRange();
    return this.shufflePoems(filteredPoems).slice(0, count);
  }

  shufflePoems(poems) {
    return [...poems].sort(() => 0.5 - Math.random());
  }

  generateQuestion(poem, choiceCount = 3) {
    const { KIMARI_JI, NUMBER, KAMINO_KU, SHIMONO_KU, POET } =
      POEM_PROPERTY_KEYS;

    const fullPoem = {
      number: poem[NUMBER],
      kaminoKu: poem[KAMINO_KU],
      shimonoKu: poem[SHIMONO_KU],
      poet: poem[POET],
    };

    return {
      kimariJi: poem[KIMARI_JI],
      correctAnswer: poem[SHIMONO_KU],
      choices: this.generateChoices(poem, choiceCount),
      fullPoem,
    };
  }

  generateChoices(correctPoem, choiceCount = 3) {
    const { SHIMONO_KU, ID } = POEM_PROPERTY_KEYS;
    const choices = [correctPoem[SHIMONO_KU]];

    const otherPoems = this.poemData.filter(
      (poem) => poem[ID] !== correctPoem[ID],
    );
    const wrongChoices = this.shufflePoems(otherPoems)
      .slice(0, choiceCount - 1)
      .map((poem) => poem[SHIMONO_KU]);

    return this.shufflePoems([...choices, ...wrongChoices]);
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
    console.log(
      `\nヒント: ${question.fullPoem[POEM_PROPERTY_KEYS.KAMINO_KU]}\n`,
    );
  }

  generateChoicesList(question, isHintVisible) {
    const choicesList = [
      ...question.choices.map((choice, i) => ({
        name: `${i + 1}) ${choice}`,
        value: choice,
      })),
      new inquirer.Separator(),
    ];

    if (!isHintVisible) {
      choicesList.push({
        name: "上の句を表示する",
        value: "HINT",
      });
    }

    return choicesList;
  }

  async selectShimonoKu(choices) {
    const { selectedShimonoKu } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedShimonoKu",
        message: "下の句を選んでください:",
        choices,
      },
    ]);
    return selectedShimonoKu;
  }

  async handleAnswerSelection(question) {
    let isHintVisible = false;
    while (true) {
      if (isHintVisible) {
        this.displayHint(question);
      }
      const choices = this.generateChoicesList(question, isHintVisible);
      const answer = await this.selectShimonoKu(choices);
      if (answer === "HINT") {
        isHintVisible = !isHintVisible;
        continue;
      }
      return answer;
    }
  }

  filterPoemsByNumRange() {
    return this.poemData.filter(
      (poem) =>
        poem[POEM_PROPERTY_KEYS.NUMBER] >= this.currentRange.start &&
        poem[POEM_PROPERTY_KEYS.NUMBER] <= this.currentRange.end,
    );
  }

  displayQuizResult(isCorrect, question) {
    console.log(isCorrect ? "\n正解！" : "\n不正解...");
    console.log(this.formatPoemDisplay(question.fullPoem));
  }

  formatPoemDisplay(poem) {
    const { NUMBER, KAMINO_KU, SHIMONO_KU, POET } = POEM_PROPERTY_KEYS;
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
}
