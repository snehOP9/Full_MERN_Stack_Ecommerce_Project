const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const formatMonthlyOrderData = (rows) => {
  const income = [];
  const sales = [];

  for (const row of rows || []) {
    const monthName = MONTH_NAMES[row?._id?.month];
    const year = row?._id?.year;
    if (!monthName || !Number.isInteger(year)) continue;

    const type = `${monthName} ${year}`;
    income.push({ type, income: row.amount });
    sales.push({ type, income: row.count });
  }

  return { income, sales };
};
