export const getOrderItems = (cart) =>
  Array.isArray(cart)
    ? cart.map((item) => ({
        product: item?.productId?._id,
        quantity: Number(item?.quantity),
        color: item?.color?._id,
        price: Number(item?.price),
      }))
    : [];

export const getCartTotal = (cart) =>
  Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + Number(item?.quantity) * Number(item?.price), 0)
    : 0;

export const isValidCheckoutCart = (cart, orderItems) =>
  Array.isArray(cart) &&
  cart.length > 0 &&
  Array.isArray(orderItems) &&
  orderItems.length === cart.length &&
  orderItems.every(
    ({ product, color, quantity, price }) =>
      typeof product === "string" &&
      product.trim().length > 0 &&
      typeof color === "string" &&
      color.trim().length > 0 &&
      Number.isInteger(quantity) &&
      quantity > 0 &&
      Number.isFinite(price) &&
      price >= 0
  );
