// カルタに関する定数を管理するファイル
export const PROPERTY_KEYS = {
  KIMARI_JI: "kimariJi",
  KAMINO_KU: "kaminoKu",
  SHIMONO_KU: "shimonoKu",
  NUMBER: "number",
  POET: "poet",
  ID: "id",
};

export const RANGE_OPTIONS = {
  ALL: { start: 1, end: 100, name: "全100首" },
  FIRST_QUARTER: { start: 1, end: 25, name: "1-25首" },
  SECOND_QUARTER: { start: 26, end: 50, name: "26-50首" },
  THIRD_QUARTER: { start: 51, end: 75, name: "51-75首" },
  FOURTH_QUARTER: { start: 76, end: 100, name: "76-100首" },
};
