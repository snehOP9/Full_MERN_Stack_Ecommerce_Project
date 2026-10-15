const test = require("node:test");
const assert = require("node:assert/strict");
const safeUser = require("../utils/safeUser");

test("removes authentication and password-reset secrets from plain objects", () => {
  const result = safeUser({
    _id: "user-1",
    email: "user@example.test",
    password: "hash",
    refreshToken: "refresh",
    passwordResetToken: "reset",
    passwordResetExpires: new Date(),
  });
  assert.deepEqual(result, { _id: "user-1", email: "user@example.test" });
});

test("does not throw for null results", () => {
  assert.equal(safeUser(null), null);
});
