const test = require("node:test");
const assert = require("node:assert/strict");
const { buildMonthlyOrderIncomePipeline } = require("../utils/monthlyOrderIncome");

test("groups by year and zero-based month using createdAt", () => {
  const pipeline = buildMonthlyOrderIncomePipeline(new Date("2026-10-12T10:00:00Z"));
  assert.deepEqual(pipeline[1].$group._id, {
    year: { $year: "$createdAt" },
    month: { $subtract: [{ $month: "$createdAt" }, 1] },
  });
  assert.deepEqual(pipeline[2], { $sort: { "_id.year": 1, "_id.month": 1 } });
});

test("the rolling 12 calendar months cross the year boundary safely", () => {
  const now = new Date("2026-01-15T12:00:00Z");
  const pipeline = buildMonthlyOrderIncomePipeline(now);
  assert.equal(pipeline[0].$match.createdAt.$gte.toISOString(), "2025-02-01T00:00:00.000Z");
  assert.equal(pipeline[0].$match.createdAt.$lte, now);

  const december = buildMonthlyOrderIncomePipeline(new Date("2026-12-31T12:00:00Z"));
  assert.equal(december[0].$match.createdAt.$gte.toISOString(), "2026-01-01T00:00:00.000Z");
});
