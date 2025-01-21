export const MENU_OPTIONS = {
  QUIZ: "かるたクイズ",
  INDEX: "決まり字索引",
};
export const POEM_PROPERTY_KEYS = {
  KIMARI_JI: "kimariJi",
  KAMINO_KU: "kaminoKu",
  SHIMONO_KU: "shimonoKu",
  NUMBER: "number",
  POET: "poet",
  ID: "id",
};

export const POEM_RANGES = {
  ALL: { start: 1, end: 100, name: "全100首" },
  FIRST_QUARTER: { start: 1, end: 25, name: "1-25首" },
  SECOND_QUARTER: { start: 26, end: 50, name: "26-50首" },
  THIRD_QUARTER: { start: 51, end: 75, name: "51-75首" },
  FOURTH_QUARTER: { start: 76, end: 100, name: "76-100首" },
};

export const KANA_ROWS = [
  "あ行",
  "か行",
  "さ行",
  "た行",
  "な行",
  "は行",
  "ま行",
  "や行",
  "ら行",
  "わ行",
];

export const KANA_SYLLABARIES = {
  あ行: ["あ", "い", "う", "え", "お"],
  か行: ["か", "き", "く", "け", "こ"],
  さ行: ["さ", "し", "す", "せ", "そ"],
  た行: ["た", "ち", "つ", "て", "と"],
  な行: ["な", "に", "ぬ", "ね", "の"],
  は行: ["は", "ひ", "ふ", "へ", "ほ"],
  ま行: ["ま", "み", "む", "め", "も"],
  や行: ["や", "ゆ", "よ"],
  ら行: ["ら", "り", "る", "れ", "ろ"],
  わ行: ["わ", "を"],
};
