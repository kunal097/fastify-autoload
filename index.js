const { readFile, readdir } = require("fs/promises");

const supported_files = ["json"];

const read_file = async (filePath) => {
  const data = await readFile(filePath, {
    encoding: "utf-8",
  });
  return JSON.parse(data);
};

const autoLoad = async (fastify, options) => {
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
          fastify.log.warn(`Unsupported file found : ${file}`);
        }
      } catch (err) {
        fastify.log.warn(`Could not parse : ${file}`);
      }
    });

    result = await Promise.all(result);

    result = result.filter((value) => value);

    result.map(({ path, data }) =>
      fastify.get(`/${path}`, (_, reply) => {
        reply.send(data);
      }),
    );
  } catch (_) {
    fastify.log.warn(`Directory not found : ${options.dir}`);
  }
  return result;
};

module.exports = autoLoad;
module.exports.autoLoad = autoLoad;
