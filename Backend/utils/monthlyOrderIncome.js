const buildMonthlyOrderIncomePipeline = (now = new Date()) => {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));

  return [
    {
      $match: {
        createdAt: { $gte: start, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $subtract: [{ $month: "$createdAt" }, 1] },
        },
        amount: { $sum: "$totalPriceAfterDiscount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ];
};

module.exports = { buildMonthlyOrderIncomePipeline };
