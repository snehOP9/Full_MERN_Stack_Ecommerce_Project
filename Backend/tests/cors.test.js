const test = require("node:test");
const assert = require("node:assert/strict");
const { isOriginAllowed } = require("../config/corsOptions");

test("allows configured browser origins", () => {
  const previous = process.env.CORS_ORIGINS;
  process.env.CORS_ORIGINS = "https://shop.example.com,https://admin.example.com";

  try {
    assert.equal(isOriginAllowed("https://shop.example.com"), true);
    assert.equal(isOriginAllowed("https://admin.example.com"), true);
  } finally {
    if (previous === undefined) delete process.env.CORS_ORIGINS;
    else process.env.CORS_ORIGINS = previous;
  }
});

test("rejects browser origins outside the allowlist", () => {
  const previous = process.env.CORS_ORIGINS;
  process.env.CORS_ORIGINS = "https://shop.example.com";

  try {
    assert.equal(isOriginAllowed("https://evil.example.com"), false);
  } finally {
    if (previous === undefined) delete process.env.CORS_ORIGINS;
    else process.env.CORS_ORIGINS = previous;
  }
});

test("allows requests without an Origin header", () => {
  assert.equal(isOriginAllowed(undefined), true);
});
