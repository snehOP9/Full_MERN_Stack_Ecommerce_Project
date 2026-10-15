import { getOrderItems, getCartTotal, isValidCheckoutCart } from "./checkout";

const item = (product, quantity = 2, price = 30) => ({
  productId: { _id: product },
  color: { _id: "blue" },
  quantity,
  price,
});

test("derives order items from a cart loaded after initial render", () => {
  expect(getOrderItems(undefined)).toEqual([]);
  const cart = [item("p1")];
  const orderItems = getOrderItems(cart);
  expect(orderItems).toEqual([
    { product: "p1", color: "blue", quantity: 2, price: 30 },
  ]);
  expect(isValidCheckoutCart(cart, orderItems)).toBe(true);
  expect(getCartTotal(cart)).toBe(60);
});

test("uses updated quantities and prices rather than stale mount-time items", () => {
  const initial = [item("p1")];
  const updated = [item("p1", 3, 40), item("p2", 1, 15)];
  expect(getOrderItems(updated)).not.toEqual(getOrderItems(initial));
  expect(getCartTotal(updated)).toBe(135);
  expect(isValidCheckoutCart(updated, getOrderItems(updated))).toBe(true);
});

test("rejects empty, loading, and invalid carts before checkout", () => {
  expect(isValidCheckoutCart(undefined, getOrderItems(undefined))).toBe(false);
  expect(isValidCheckoutCart([], getOrderItems([]))).toBe(false);
  for (const bad of [
    [{ ...item("p1"), productId: null }],
    [item("p1", 0)],
    [item("p1", -1)],
    [item("p1", 1.5)],
    [item("p1", 1, NaN)],
  ]) {
    expect(isValidCheckoutCart(bad, getOrderItems(bad))).toBe(false);
  }
});

test("rejects missing order item arrays and blank identifiers", () => {
  const cart = [item("p1")];
  expect(isValidCheckoutCart(cart, undefined)).toBe(false);
  expect(isValidCheckoutCart(cart, null)).toBe(false);
  for (const bad of [
    [{ ...item("p1"), productId: { _id: "   " } }],
    [{ ...item("p1"), color: { _id: "" } }],
    [{ ...item("p1"), color: { _id: "  " } }],
  ]) {
    expect(isValidCheckoutCart(bad, getOrderItems(bad))).toBe(false);
  }
});

test("does not propagate invalid numbers into the displayed cart total", () => {
  expect(getCartTotal([item("p1", 2, NaN), item("p2", 3, 10)])).toBe(30);
  expect(getCartTotal([item("p1", Infinity, 10)])).toBe(0);
  expect(getCartTotal([item("p1", 2, 10)])).toBe(20);
});

test("rejects cart items whose subtotals overflow", () => {
  const cart = [item("p1", 2, Number.MAX_VALUE)];
  expect(isValidCheckoutCart(cart, getOrderItems(cart))).toBe(false);
});

test("rejects carts whose aggregate total overflows", () => {
  const cart = [item("p1", 1, Number.MAX_VALUE), item("p2", 1, Number.MAX_VALUE)];
  expect(getCartTotal(cart)).toBe(Infinity);
  expect(isValidCheckoutCart(cart, getOrderItems(cart))).toBe(false);
});
