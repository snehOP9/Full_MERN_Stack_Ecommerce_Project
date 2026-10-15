const Razorpay = require("razorpay");
const Cart = require("../models/cartModel");
const { verifyRazorpaySignature, buildOrderItemsFromCart } = require("../utils/paymentSecurity");

const SHIPPING_FEE_PAISE = 10000;

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    const error = new Error("Payment gateway is not configured");
    error.statusCode = 503;
    throw error;
  }
  return new Razorpay({ key_id, key_secret });
}

async function verifyPaymentDetails({ userId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    const error = new Error("Invalid payment signature");
    error.statusCode = 400;
    throw error;
  }

  const client = getRazorpayClient();
  const [order, payment] = await Promise.all([
    client.orders.fetch(razorpayOrderId),
    client.payments.fetch(razorpayPaymentId),
  ]);

  if (
    String(order?.notes?.userId || "") !== String(userId) ||
    payment?.order_id !== razorpayOrderId ||
    payment?.status !== "captured" ||
    payment?.amount !== order?.amount ||
    order?.currency !== "INR"
  ) {
    const error = new Error("Payment could not be verified");
    error.statusCode = 400;
    throw error;
  }

  return {
    order,
    payment,
    paymentInfo: { razorpayOrderId, razorpayPaymentId },
  };
}

const checkout = async (req, res) => {
  try {
    const client = getRazorpayClient();
    const cart = await Cart.find({ userId: req.user._id }).populate("productId");
    const { subtotal } = buildOrderItemsFromCart(cart);
    const amount = Math.round(subtotal * 100) + SHIPPING_FEE_PAISE;
    const order = await client.orders.create({
      amount,
      currency: "INR",
      notes: { userId: String(req.user._id) },
    });
    return res.json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    const status = error.statusCode || (error.message === "Cart is empty" ? 400 : 502);
    return res.status(status).json({
      error: status === 503 ? "Payment gateway is not configured" :
        status === 400 ? error.message : "Unable to start checkout",
    });
  }
};

const paymentVerification = async (req, res) => {
  try {
    const verified = await verifyPaymentDetails({
      userId: req.user._id,
      razorpayOrderId: req.body.razorpayOrderId,
      razorpayPaymentId: req.body.razorpayPaymentId,
      razorpaySignature: req.body.razorpaySignature,
    });
    return res.json({
      ...verified.paymentInfo,
      razorpaySignature: req.body.razorpaySignature,
      amount: verified.order.amount,
    });
  } catch (error) {
    const status = error.statusCode || 502;
    return res.status(status).json({
      error: status === 503 ? "Payment gateway is not configured" :
        status === 400 ? error.message : "Unable to verify payment",
    });
  }
};

module.exports = { checkout, paymentVerification, verifyPaymentDetails, getRazorpayClient };
