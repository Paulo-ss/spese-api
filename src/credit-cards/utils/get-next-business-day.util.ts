export const getNextBusinessDay = (date: Date) => {
  const dayOfTheWeek = date.toLocaleDateString('en-us', { weekday: 'long' });

  if (dayOfTheWeek === 'Saturday') {
    date.setDate(date.getDate() + 2);
  }

  if (dayOfTheWeek === 'Sunday') {
    date.setDate(date.getDate() + 1);
  }

  return date;
};
