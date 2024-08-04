import { FastifyInstance } from "fastify";

import { loadFiles } from "./helper";
import { TpluginOption } from "./types";

const autoLoad = async (fastify: FastifyInstance, options: TpluginOption) => {
  let { dir } = options;

  if (!dir) {
    fastify.log?.warn("Nothing to load");
    return;
  }

  if (!Array.isArray(dir)) dir = [dir];

  const result = await Promise.all(
    dir.map((path) => loadFiles(path, fastify.log))
  );

  result
    .flat()
    .filter((_item) => _item !== null && _item !== undefined)
    .forEach(({ path, data }) =>
      fastify.get(`/${path}`, (_, reply) => {
        fastify.log?.debug(`Loading path : ${path}`);
        reply.send(data);
      })
    );
};

export default autoLoad;
