#! /usr/bin/env node
import { KarutaApp } from "./models/KarutaApp.js";
import { loadWakaData } from "./utils/fileLoader.js";

async function main() {
  const wakaData = await loadWakaData();
  const app = new KarutaApp(wakaData);

  // 問題数3問、選択肢4つの場合
  await app.start(3);

  // または、デフォルトの3問、3択の場合
  // await app.start();
}

main().catch(console.error);
