const { readFile, readdir } = require("fs/promises");
const { URL } = require("url");
const fp = require("fastify-plugin");

const supported_files = ["json"];

let logger = null;

const read_file = async (filePath) => {
  const data = await readFile(filePath, {
    encoding: "utf-8",
  });
  return JSON.parse(data);
};

const main = async (options) => {
  let result = [];
  try {
    const files = await readdir(`${options.dir}`);

    result = files.map(async (file) => {
      const [fileName, ext] = file.toLowerCase().split(".");

      try {
        if (fileName && supported_files.includes(ext)) {
          return {
            path: `${options.dir}/${fileName}`,
            data: await read_file(`${options.dir}/${file}`),
          };
        } else {
          logger.warn(`Unsupported file found : ${file}`);
        }
      } catch (err) {
        logger.warn(`Could not parse : ${file}`);
      }
    });

    result = await Promise.all(result);

    result = result.filter((value) => value);
  } catch (_) {
    logger.warn(`Directory not found : ${options.dir}`);
  }
  return result;
};

module.exports = fp(async function (fastify, opts) {
  logger = fastify.log;
  const result = await main(opts);

  result.map(({ path, data }) =>
    fastify.get(`/${path}`, (_, reply) => {
      reply.send(data);
    }),
  );
});
