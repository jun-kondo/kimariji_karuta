import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

export async function loadKarutaData() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const dataPath = join(__dirname, "../data/karuta_data.json");

  return JSON.parse(await readFile(dataPath, "utf8"));
}
