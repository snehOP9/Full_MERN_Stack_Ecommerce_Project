const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { verifyRazorpaySignature, buildOrderItemsFromCart } = require("../utils/paymentSecurity");

test("accepts a valid Razorpay checkout signature", () => {
  const secret = "test-secret";
  const orderId = "order_test";
  const paymentId = "pay_test";
  const signature = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  assert.equal(verifyRazorpaySignature(orderId, paymentId, signature, secret), true);
});

test("rejects missing or altered Razorpay signatures", () => {
  assert.equal(verifyRazorpaySignature("order_test", "pay_test", "", "test-secret"), false);
  assert.equal(verifyRazorpaySignature("order_test", "pay_test", "00".repeat(32), "test-secret"), false);
  assert.equal(verifyRazorpaySignature("order_test", "pay_test", "a".repeat(64), "test-secret"), false);
});

test("builds order lines from catalog prices rather than cart prices", () => {
  const result = buildOrderItemsFromCart([
    { productId: { _id: "p1", price: 25, quantity: 10 }, color: "c1", quantity: 2, price: 0.01 },
    { productId: { _id: "p2", price: 10, quantity: 3 }, color: "c2", quantity: 1, price: 99999 },
  ]);
  assert.equal(result.subtotal, 60);
  assert.deepEqual(result.orderItems.map((item) => item.price), [25, 10]);
});

test("rejects empty carts and invalid quantities", () => {
  assert.throws(() => buildOrderItemsFromCart([]), /Cart is empty/);
  assert.throws(() => buildOrderItemsFromCart([
    { productId: { _id: "p1", price: 25, quantity: 10 }, color: "c1", quantity: 0 },
  ]), /invalid product or quantity/i);
  assert.throws(() => buildOrderItemsFromCart([
    { productId: { _id: "p1", price: 25, quantity: 1 }, color: "c1", quantity: 2 },
  ]), /invalid product or quantity/i);
});
