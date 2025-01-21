#! /usr/bin/env node
import { KarutaApp } from "./models/KarutaApp.js";
import { loadPoemData } from "./utils/fileLoader.js";

async function main() {
  const poemData = await loadPoemData();
  const app = new KarutaApp(poemData);
  await app.start();
}

main().catch(console.error);
