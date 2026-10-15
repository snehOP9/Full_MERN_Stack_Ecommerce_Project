const crypto = require("crypto");

function verifyRazorpaySignature(orderId, paymentId, signature, secret = process.env.RAZORPAY_KEY_SECRET) {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(String(signature), "hex");
  return providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

function buildOrderItemsFromCart(cart) {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error("Cart is empty");
  }

  let subtotal = 0;
  const orderItems = cart.map((item) => {
    const product = item?.productId;
    const price = Number(product?.price);
    const quantity = Number(item?.quantity);
    if (!product?._id || !item?.color ||
        !Number.isFinite(price) || price < 0 ||
        !Number.isInteger(quantity) || quantity < 1 || quantity > 99 ||
        (Number.isFinite(Number(product?.quantity)) && quantity > Number(product.quantity))) {
      throw new Error("Cart contains an invalid product or quantity");
    }

    subtotal += price * quantity;
    if (!Number.isSafeInteger(Math.round(subtotal * 100))) {
      throw new Error("Cart total is outside the supported range");
    }

    return {
      product: product._id,
      color: item.color,
      quantity,
      price,
    };
  });

  return { subtotal, orderItems };
}

module.exports = { verifyRazorpaySignature, buildOrderItemsFromCart };
