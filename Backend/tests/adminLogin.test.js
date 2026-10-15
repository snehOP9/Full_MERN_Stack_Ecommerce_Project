const test = require("node:test");
const assert = require("node:assert/strict");
const User = require("../models/userModel");
const { loginAdmin } = require("../controller/userCtrl");

test("unknown admin email returns the normal invalid credentials error", async () => {
  const originalFindOne = User.findOne;
  User.findOne = async () => null;
  try {
    let nextError;
    await loginAdmin({ body: { email: "missing-admin@example.test", password: "test-password" } }, {}, (error) => {
      nextError = error;
    });
    assert.ok(nextError);
    assert.equal(nextError.message, "Invalid Credentials");
    assert.equal(nextError.message.includes("Cannot read properties"), false);
  } finally {
    User.findOne = originalFindOne;
  }
});
