export const getInvoiceMonth = (
  closingDay: number,
  date: Date,
): { month: number; year: number } => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  if (day < closingDay) {
    return { month, year };
  }

  if (month === 11) {
    return { month: 0, year: year + 1 };
  }

  return { month: month + 1, year };
};
