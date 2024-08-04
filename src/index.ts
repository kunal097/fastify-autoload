import { readFile, readdir } from "fs/promises";
import { existsSync } from "fs";

import { FastifyInstance, FastifyBaseLogger } from "fastify";

interface pluginOption {
  dir: string | string[];
}

const supported_files = ["json"];

let logger: FastifyBaseLogger | undefined = undefined;

const read_file = async (filePath: string) => {
  try {
    const [fileName, ext] = filePath.toLowerCase().split(".");

    if (!fileName || !supported_files.includes(ext)) {
      logger?.warn(`Unsupported file found : ${filePath}`);
    }
    const data = await readFile(filePath, {
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

const load_files = async (directory_path: string) => {
  if (!existsSync(directory_path)) {
    logger!.warn(`${directory_path} Directory not exists`);
    return;
  }
  const files = await readdir(`${directory_path}`);
  return Promise.all(
    files.map((filePath) => read_file(`${directory_path}/${filePath}`))
  );
};

const autoLoad = async (fastify: FastifyInstance, options: pluginOption) => {
  let { dir } = options;

  logger = fastify.log || console;

  if (!dir) {
    logger?.warn("Nothing to load");
    return;
  }

  if (!Array.isArray(dir)) dir = [dir];

  const result = await Promise.all(dir.map((path) => load_files(path)));

  result
    .flat()
    .filter((_item) => _item !== null && _item !== undefined)
    .forEach(({ path, data }) =>
      fastify.get(`/${path}`, (_, reply) => {
        logger?.debug(`Loading path : ${path}`);
        reply.send(data);
      })
    );
};

export default autoLoad;
