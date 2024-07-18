const { readFile, readdir } = require("fs/promises");
const { URL } = require("url");
const fp = require("fastify-plugin");

const supported_files = ["json"];

const read_file = async (filePath) => {
  const data = await readFile(filePath, {
    encoding: "utf-8",
  });
  return JSON.parse(data);
};

const main = async (options) => {
  try {
    const files = await readdir(`${__dirname}/${options.dir}`);

    let result = files.map(async (file) => {
      const [fileName, ext] = file.toLowerCase().split(".");

      try {
        if (fileName && supported_files.includes(ext)) {
          return {
            path: `${options.dir}/${fileName}`,
            data: await read_file(`${__dirname}/${options.dir}/${file}`),
          };
        } else {
          console.warn(`Unsupported file found : ${file}`);
        }
      } catch (err) {
        console.warn(`File ignored : ${file}`);
      }
    });

    result = await Promise.all(result);

    result = result.filter((value) => value);

    return result;
  } catch (_) {
    console.warn(`Ignored directory : ${options.dir}`);
  }
};

module.exports = fp(async function (fastify, opts) {
  const result = await main(opts);
  result.map(({ path, data }) =>
    fastify.get(`/${path}`, (_, reply) => {
      reply.send(data);
    }),
  );
});
