import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';

type DateTypes = Date | string | Dayjs;

export const isDateGreaterThanOrEqualTo = ({
    date,
    otherDate,
}: {
    date: DateTypes;
    otherDate: DateTypes;
}): boolean => {
    return dayjs(date).isAfter(otherDate) || dayjs(date).isSame(otherDate);
};

export const getFirstDayOfMonth = (date: DateTypes): Dayjs => {
    return dayjs(date).startOf('month');
};

export const getLastDayOfMonth = (date: DateTypes): Dayjs => {
    return dayjs(date).endOf('month');
};

export const getDatesBetween = (
    startDate: DateTypes,
    endDate: DateTypes,
): Date[] => {
    const dates: Date[] = [];
    let currentDate = dayjs(startDate);

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
        dates.push(currentDate.toDate());
        currentDate = currentDate.add(1, 'day');
    }

    return dates;
};

export const getMonthsInBetween = (
    fromMonth: DateTypes,
    toMonth?: DateTypes,
): Date[] => {
    if (!toMonth) {
        return [dayjs(fromMonth).toDate()];
    }

    const monthsDiff = dayjs(fromMonth).diff(toMonth, 'month');

    return Array.from({ length: monthsDiff })
        .fill(dayjs(fromMonth))
        .map((date: Dayjs, index) =>
            dayjs(date)
                .month(date.month() + index)
                .toDate(),
        );
};

export const getMonthCalendarDates = (date: DateTypes) => {
    const firstDayOfTheMonth = getFirstDayOfMonth(date);
    const lastDayOfTheMonth = getLastDayOfMonth(date);

    const calendarDates: Date[] = [];

    let previousDay = firstDayOfTheMonth.subtract(1, 'day');

    // 6 is Saturday
    while (previousDay.day() !== 6) {
        calendarDates.unshift(previousDay.toDate());
        previousDay = previousDay.subtract(1, 'day');
    }

    calendarDates.push(
        ...getDatesBetween(firstDayOfTheMonth, lastDayOfTheMonth),
    );

    let nextDay = lastDayOfTheMonth.add(1, 'day');

    // 0 is Sunday
    while (nextDay.day() !== 0) {
        calendarDates.push(nextDay.toDate());
        nextDay = nextDay.add(1, 'day');
    }

    return calendarDates;
};

export const getNextBusinessDay = (date: DateTypes) => {
    const dayjsDate = dayjs(date);

    if (dayjsDate.day() === 6) {
        return dayjsDate.add(2, 'day');
    }

    if (dayjsDate.day() === 0) {
        return dayjsDate.add(1, 'day');
    }

    return dayjsDate;
};

export const formatDate = (date: DateTypes, template: string): string => {
    return dayjs(date).format(template);
};

export const getToday = (): Dayjs => {
    return dayjs();
};
