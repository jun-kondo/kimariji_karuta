import inquirer from "inquirer";
import { KarutaQuiz } from "./KarutaQuiz.js";
import { PoemReference } from "./PoemReference.js";
import { MENU_OPTIONS } from "../constants/constants.js";

export class KarutaApp {
  constructor(poemData) {
    this.poemData = poemData;
  }

  async start() {
    console.log("決まり字かるたアプリへようこそ！");

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
        case "quiz": {
          const karutaQuiz = new KarutaQuiz(this.poemData);
          await karutaQuiz.startQuiz();
          break;
        }
        case "index": {
          const poemReference = new PoemReference(this.poemData);
          await poemReference.displayIndex();
          break;
        }
        case "exit":
          console.log("さようなら！");
          return;
      }
    }
  }
}
