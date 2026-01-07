import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export const dateToUserTimezone = (
  date: Date | string,
  timezone: string,
): Date => {
  return toZonedTime(date, timezone);
};

export const formatInTimezone = (
  date: Date | string,
  timezone: string,
  formatStr: string = 'yyyy-MM-dd HH:mm:ss',
): string => {
  return formatInTimeZone(date, timezone, formatStr);
};

export const getFirstDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getLastDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

export const getMonthCalendarDates = (date: Date) => {
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

export const getPreviousBusinessDay = (date: Date) => {
  const dayOfTheWeek = date.toLocaleDateString('en-us', { weekday: 'long' });

  if (dayOfTheWeek === 'Saturday') {
    date.setDate(date.getDate() - 1);
  }

  if (dayOfTheWeek === 'Sunday') {
    date.setDate(date.getDate() - 2);
  }

  return date;
};

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

export const addDaysToDate = (date: Date, days: number) => {
  const newDate = new Date(date);

  newDate.setDate(newDate.getDate() + days);
  return newDate;
};
