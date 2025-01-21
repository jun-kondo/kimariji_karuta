import inquirer from "inquirer";
import {
  BACK,
  KANA_ROWS,
  KANA_SYLLABARIES,
  POEM_PROPERTY_KEYS,
} from "../constants/constants.js";

export class PoemReference {
  constructor(poemData) {
    this.poemData = poemData;
  }

  async displayIndex() {
    while (true) {
      const selectedRow = await this.selectRow();

      if (selectedRow === BACK) {
        return;
      }

      const selectedKimariJi = await this.selectKimariJi(selectedRow);
      if (selectedKimariJi !== BACK) {
        console.log(this.formatPoemDisplay(selectedKimariJi));
      }
    }
  }

  async selectRow() {
    const { selectedRow } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedRow",
        message:
          "決まり字から和歌を参照できます！ あ~わ行から選択してください:",
        choices: [...KANA_ROWS, new inquirer.Separator(), BACK],
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
          BACK,
        ],
      },
    ]);

    return selectedKimariJi;
  }

  filterPoemsByKanaRow(row) {
    return this.poemData
      .filter((poem) =>
        KANA_SYLLABARIES[row].includes(poem[POEM_PROPERTY_KEYS.KIMARI_JI]?.[0]),
      )
      .sort((a, b) =>
        a[POEM_PROPERTY_KEYS.KIMARI_JI].localeCompare(
          b[POEM_PROPERTY_KEYS.KIMARI_JI],
        ),
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
}
