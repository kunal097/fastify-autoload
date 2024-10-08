import Fastify from "fastify";
import autoLoad from "../src";

const log = require("pino")({ level: "fatal" });

const build = (options: { dir: string | string[] }) => {
  const app = Fastify({ logger: log });

  beforeAll(async () => {
    void app.register(autoLoad, options);
    await app.ready();
  });

  afterAll(() => app.close());

  return app;
};

describe("Autoload plugin test suit for existing dir", () => {
  const app = build({
    dir: "__tests__/files",
  });
  test("Check for server route", async () => {
    const res = await app.inject({
      url: "__tests__/files/server",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ name: "server config", env: "test" });
  });

  test("Check for invalid route", async () => {
    const res = await app.inject({
      url: "__tests__/files/invalid",
    });

    expect(res.statusCode).toBe(404);
  });
});

describe("Autoload plugin test suit for multiple directory", () => {
  const app = build({
    dir: ["__tests__/files", "__tests__/server-config"],
  });

  test("Check for server route from files directory", async () => {
    const res = await app.inject({
      url: "__tests__/files/server",
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ name: "server config", env: "test" });
  });

  test("Check for server route from config directory", async () => {
    const res = await app.inject({
      url: "__tests__/server-config/server",
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      name: "server config from __tests__/config",
      env: "test",
    });
  });

  test("Check for invalid route from files directroy", async () => {
    const res = await app.inject({
      url: "api/server-config/__tests__/files/invalid",
    });

    expect(res.statusCode).toBe(404);
  });

  test("Check for invalid route from config directroy", async () => {
    const res = await app.inject({
      url: "api/server-config/__tests__/server-config/invalid",
    });

    expect(res.statusCode).toBe(404);
  });
});

describe("Autoload plugin test suit for non-existent directory", () => {
  const app = build({
    dir: "__tests__/non-existent",
  });
  test("Check for server route", async () => {
    const res = await app.inject({
      url: "__tests__/files/server",
    });

    expect(res.statusCode).toBe(404);
  });
});

describe("Autoload plugin test suit for invalid dir option", () => {
  //@ts-ignore
  const app = build({});
  test("Check for server route", async () => {
    const res = await app.inject({
      url: "__tests__/files/server",
    });

    expect(res.statusCode).toBe(404);
  });
});

export default build;
