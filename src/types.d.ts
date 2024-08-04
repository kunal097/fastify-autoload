import { FastifyInstance, FastifyBaseLogger } from "fastify";

type Tlogger = FastifyBaseLogger | undefined;

type TpluginOption = {
  dir: string | string[];
};

export { Tlogger, TpluginOption };
