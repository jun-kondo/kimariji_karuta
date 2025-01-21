#! /usr/bin/env node
import { KarutaApp } from "./models/KarutaApp.js";
import { loadPoemData } from "./utils/fileLoader.js";

async function main() {
  const poemData = await loadPoemData();
  const app = new KarutaApp(poemData);

  // 問題数3問、選択肢4つの場合
  await app.start(3);

  // または、デフォルトの3問、3択の場合
  // await app.start();
}

main().catch(console.error);
