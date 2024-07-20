import { readFile, readdir } from "fs/promises";

import { FastifyInstance } from "fastify";

interface pluginOption {
  dir: string;
}

const supported_files = ["json"];

const read_file = async (filePath: string) => {
  const data = await readFile(filePath, {
    encoding: "utf-8",
  });
  return JSON.parse(data);
};

const autoLoad = async (fastify: FastifyInstance, options: pluginOption) => {
  let result = [];
  try {
    const files = await readdir(`${options.dir}`);

    result = files.map(async (file) => {
      const [fileName, ext] = file.toLowerCase().split(".");

      const result = {
        path: `${options.dir}/${fileName}`,
        data: null,
      };

      try {
        if (fileName && supported_files.includes(ext)) {
          result.data = await read_file(`${options.dir}/${file}`);
        } else {
          fastify.log.warn(`Unsupported file found : ${file}`);
        }
      } catch (err) {
        fastify.log.warn(`Could not parse : ${file}`);
      }

      return result;
    });

    result = await Promise.all(result);

    result.forEach(({ path, data }) => {
      if (data) {
        fastify.get(`/${path}`, (_, reply) => {
          reply.send(data);
        });
      }
    });
  } catch (_) {
    fastify.log.warn(`Directory not found : ${options.dir}`);
  }
};

export default autoLoad;
