import { readFile as readFilePromise, readdir } from "fs/promises";
import { existsSync } from "fs";
import { Tlogger } from "./types";

const supported_files = ["json"];

const readFile = async (filePath: string, logger: Tlogger) => {
  try {
    const [fileName, ext] = filePath.toLowerCase().split(".");

    if (!fileName || !supported_files.includes(ext)) {
      logger?.warn(`Unsupported file found : ${filePath}`);
    }
    const data = await readFilePromise(filePath, {
      encoding: "utf-8",
    });

    return {
      path: fileName,
      data: JSON.parse(data),
    };
  } catch (err) {
    logger?.warn(`Could not parse : ${filePath}`);

    return null;
  }
};

const loadFiles = async (directory_path: string, logger: Tlogger) => {
  if (!existsSync(directory_path)) {
    logger!.warn(`${directory_path} Directory not exists`);
    return;
  }
  const files = await readdir(`${directory_path}`);
  return Promise.all(
    files.map((filePath) => readFile(`${directory_path}/${filePath}`, logger))
  );
};

export { loadFiles };
