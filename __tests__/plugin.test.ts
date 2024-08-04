import Fastify from "fastify";
import autoLoad from "../src";

const build = (options: { dir: string; prefix?: string }) => {
  const app = Fastify();

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
    //@ts-ignore
    dir: ["__tests__/files", "__tests__/config"],
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
      url: "__tests__/config/server",
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      name: "server config from __tests__/config",
      env: "test",
    });
  });

  test("Check for invalid route from files directroy", async () => {
    const res = await app.inject({
      url: "api/config/__tests__/files/invalid",
    });

    expect(res.statusCode).toBe(404);
  });

  test("Check for invalid route from config directroy", async () => {
    const res = await app.inject({
      url: "api/config/__tests__/config/invalid",
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

export default build;
