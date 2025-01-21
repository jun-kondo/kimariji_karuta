import inquirer from "inquirer";
import { shuffleArray } from "../utils/randomizer.js";
import {
  MENU_OPTIONS,
  POEM_PROPERTY_KEYS,
  POEM_RANGES,
  KANA_ROWS,
  KANA_SYLLABARIES,
} from "../constants/constants.js";

export class KarutaApp {
  constructor(wakaData) {
    this.wakaData = wakaData;
    this.currentRange = POEM_RANGES.ALL;
  }

  async start() {
    console.log("百人一首へようこそ！");

    while (true) {
      const { mainMenuChoice } = await inquirer.prompt([
        {
          type: "list",
          name: "mainMenuChoice",
          message: "モードを選択してください:",
          choices: [
            { name: MENU_OPTIONS.QUIZ, value: "quiz" },
            { name: MENU_OPTIONS.INDEX, value: "index" },
            { name: "終了", value: "exit" },
          ],
        },
      ]);

      switch (mainMenuChoice) {
        case "quiz":
          await this.startQuiz();
          break;
        case "index":
          await this.displayIndex();
          break;
        case "exit":
          console.log("さようなら！");
          return;
      }
    }
  }

  async startQuiz(questionCount = 3, choiceCount = 3) {
    const rangeSelection = await this.selectPoemsRange();
    this.currentRange = rangeSelection.range;
    console.log(`\n${rangeSelection.range.name}から出題します。\n`);
    const questions = this.generateQuestions(questionCount, choiceCount);
    await this.conductQuiz(questions);
  }

  async displayIndex() {
    while (true) {
      const selectedRow = await this.selectRow();

      if (selectedRow === "戻る") {
        return;
      }

      const selectedKimariJi = await this.selectKimariJi(selectedRow);
      if (selectedKimariJi !== "戻る") {
        console.log(this.formatPoemDisplay(selectedKimariJi));
      }
    }
  }

  async selectRow() {
    const { selectedRow } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedRow",
        message: "行を選んでください:",
        choices: [...KANA_ROWS, new inquirer.Separator(), "戻る"],
      },
    ]);
    return selectedRow;
  }

  async selectKimariJi(selectedRow) {
    const filteredPoems = this.filterPoemsByKanaRow(selectedRow);
    const { selectedKimariJi } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedKimariJi",
        message: `${selectedRow} の決まり字を選んでください:`,
        choices: [
          ...filteredPoems.map((poem) => ({
            name: poem[POEM_PROPERTY_KEYS.KIMARI_JI],
            value: poem,
          })),
          new inquirer.Separator(),
          "戻る",
        ],
      },
    ]);

    return selectedKimariJi;
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
    return shuffleArray(filteredPoems).slice(0, count);
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

    const otherPoems = this.wakaData.filter(
      (poem) => poem[ID] !== correctPoem[ID],
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

  filterPoemsByKanaRow(row) {
    // const selectedKana = KANA_SYLLABARIES[row] || [];

    return this.wakaData
      .filter((poem) =>
        KANA_SYLLABARIES[row].includes(poem[POEM_PROPERTY_KEYS.KIMARI_JI]?.[0]),
      )
      .sort((a, b) =>
        a[POEM_PROPERTY_KEYS.KIMARI_JI].localeCompare(
          b[POEM_PROPERTY_KEYS.KIMARI_JI],
        ),
      );
  }

  filterPoemsByNumRange() {
    return this.wakaData.filter(
      (poem) =>
        poem[POEM_PROPERTY_KEYS.NUMBER] >= this.currentRange.start &&
        poem[POEM_PROPERTY_KEYS.NUMBER] <= this.currentRange.end,
    );
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

  displayQuizResult(isCorrect, question) {
    console.log(isCorrect ? "\n正解！" : "\n不正解...");
    console.log(this.formatPoemDisplay(question.fullPoem));
  }
}
