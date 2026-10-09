const crypto = require("crypto");
const Razorpay = require("razorpay");

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    const error = new Error("Razorpay is not configured");
    error.statusCode = 503;
    throw error;
  }

  return new Razorpay({ key_id, key_secret });
};

const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string" ||
    typeof secret !== "string" ||
    !orderId ||
    !paymentId ||
    !signature ||
    !secret ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "hex");
  const received = Buffer.from(signature, "hex");

  return received.length === expected.length && crypto.timingSafeEqual(expected, received);
};

const checkout = async (req, res) => {
  const amount = Number(req.body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: "A valid payment amount is required" });
  }

  const order = await getRazorpayInstance().orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
  });

  return res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
    order,
  });
};

const paymentVerification = async (req, res) => {
  const { orderCreationId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (
    typeof orderCreationId !== "string" ||
    typeof razorpayOrderId !== "string" ||
    typeof razorpayPaymentId !== "string" ||
    typeof razorpaySignature !== "string" ||
    !orderCreationId ||
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature ||
    orderCreationId !== razorpayOrderId
  ) {
    return res.status(400).json({ success: false, message: "Invalid payment verification details" });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!process.env.RAZORPAY_KEY_ID || !secret) {
    return res.status(503).json({ success: false, message: "Payment verification is not configured" });
  }

  if (!verifyRazorpaySignature(orderCreationId, razorpayPaymentId, razorpaySignature, secret)) {
    return res.status(400).json({ success: false, message: "Payment verification failed" });
  }

  return res.json({
    success: true,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
};

module.exports = {
  checkout,
  paymentVerification,
  verifyRazorpaySignature,
};
