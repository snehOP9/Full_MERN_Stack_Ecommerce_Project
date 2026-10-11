import { formatMonthlyOrderData } from "./monthlyOrderData";

test("January in different years remains two separate chart categories", () => {
  const { income, sales } = formatMonthlyOrderData([
    { _id: { year: 2025, month: 0 }, amount: 90, count: 1 },
    { _id: { year: 2026, month: 0 }, amount: 140, count: 2 },
  ]);
  expect(income).toEqual([
    { type: "January 2025", income: 90 },
    { type: "January 2026", income: 140 },
  ]);
  expect(sales).toEqual([
    { type: "January 2025", income: 1 },
    { type: "January 2026", income: 2 },
  ]);
});

test("December to January labels stay distinct and invalid buckets are skipped", () => {
  const { income } = formatMonthlyOrderData([
    { _id: { year: 2025, month: 11 }, amount: 5, count: 1 },
    { _id: { year: 2026, month: 0 }, amount: 7, count: 1 },
    { _id: { month: 4 }, amount: 900, count: 1 },
  ]);
  expect(income.map(({ type }) => type)).toEqual(["December 2025", "January 2026"]);
});
