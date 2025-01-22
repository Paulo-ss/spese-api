import getDatesBetween from 'src/credit-cards/utils/get-dates-between.util';

const getMonthCalendarDates = (date: Date) => {
  const firstDayOfTheMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDayOfTheMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  );

  const calendarDates: Date[] = [];

  const previousDay = new Date(firstDayOfTheMonth);
  previousDay.setDate(previousDay.getDate() - 1);

  while (
    previousDay.toLocaleDateString('en-us', { weekday: 'long' }) !== 'Saturday'
  ) {
    calendarDates.unshift(new Date(previousDay));
    previousDay.setDate(previousDay.getDate() - 1);
  }

  calendarDates.push(...getDatesBetween(firstDayOfTheMonth, lastDayOfTheMonth));

  const nextDay = new Date(lastDayOfTheMonth);
  nextDay.setDate(nextDay.getDate() + 1);

  while (
    nextDay.toLocaleDateString('en-us', { weekday: 'long' }) !== 'Sunday'
  ) {
    calendarDates.push(new Date(nextDay));
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return calendarDates;
};

export default getMonthCalendarDates;
