const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");

const { verifyRazorpaySignature } = require("./paymentCtrl");

const secret = "test-only-secret";
const orderId = "order_test_123";
const paymentId = "pay_test_456";
const sign = (order, payment) =>
  crypto.createHmac("sha256", secret).update(`${order}|${payment}`).digest("hex");

test("accepts a valid Razorpay checkout signature", () => {
  assert.equal(verifyRazorpaySignature(orderId, paymentId, sign(orderId, paymentId), secret), true);
});

test("rejects a signature generated for a different payment", () => {
  assert.equal(verifyRazorpaySignature(orderId, paymentId, sign(orderId, "pay_other"), secret), false);
});

test("rejects a signature generated with a different secret", () => {
  const signature = crypto.createHmac("sha256", "another-secret").update(`${orderId}|${paymentId}`).digest("hex");
  assert.equal(verifyRazorpaySignature(orderId, paymentId, signature, secret), false);
});

test("rejects malformed signatures and missing values", () => {
  assert.equal(verifyRazorpaySignature(orderId, paymentId, "not-a-signature", secret), false);
  assert.equal(verifyRazorpaySignature(orderId, paymentId, "", secret), false);
  assert.equal(verifyRazorpaySignature(orderId, paymentId, sign(orderId, paymentId), ""), false);
});
