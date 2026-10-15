const test = require("node:test");
const assert = require("node:assert/strict");
const validateEnv = require("../config/validateEnv");

test("rejects missing database URL and weak JWT secret", () => {
  assert.throws(() => validateEnv({}), /MONGODB_URL is required/);
  assert.throws(() => validateEnv({ MONGODB_URL: "mongodb://localhost/db", JWT_SECRET: "short" }), /JWT_SECRET must be a real random value/);
});

test("rejects example placeholders", () => {
  assert.throws(() => validateEnv({
    MONGODB_URL: "mongodb://localhost/db",
    JWT_SECRET: "replace-with-a-generated-random-secret-at-least-32-characters",
  }), /JWT_SECRET must be a real random value/);
});

test("accepts configured database and strong secret", () => {
  assert.doesNotThrow(() => validateEnv({
    MONGODB_URL: "mongodb://localhost/db",
    JWT_SECRET: "a-real-random-secret-value-that-is-at-least-32-characters",
  }));
});
