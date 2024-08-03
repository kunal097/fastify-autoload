import Fastify from "fastify";
import autoLoad from "../src";

const build = (path: string) => {
  const app = Fastify();

  beforeAll(async () => {
    void app.register(autoLoad, {
      dir: path,
    });
    await app.ready();
  });

  afterAll(() => app.close());

  return app;
};

describe("Autoload plugin test suit for existing dir", () => {
  const app = build("__tests__/files");
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

describe("Autoload plugin test suit for non-existent directory", () => {
  const app = build("__tests__/non-existent");
  test("Check for server route", async () => {
    const res = await app.inject({
      url: "__tests__/files/server",
    });

    expect(res.statusCode).toBe(404);
  });
});
