import { formatInTimeZone } from 'date-fns-tz';
import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { DATE_YYYY_MM_DD_REGEX, DATE_YYYY_MM_REGEX } from './regex.const';
import { BadRequestException } from '@nestjs/common';

type DateTypes = Date | string | Dayjs;

export const formatInTimezone = (
    date: DateTypes,
    timezone: string,
    formatStr: string = 'yyyy-MM-dd HH:mm:ss',
): string => {
    return formatInTimeZone(dayjs(date).toDate(), timezone ?? 'UTC', formatStr);
};

export const isDateGreaterThanOrEqualTo = ({
    date,
    otherDate,
}: {
    date: DateTypes;
    otherDate: DateTypes;
}): boolean => {
    return dayjs(date).isAfter(otherDate) || dayjs(date).isSame(otherDate);
};

export const getFirstDayOfMonth = (date: DateTypes): string => {
    return dayjs(date).startOf('month').format('YYYY-MM-DD');
};

export const getLastDayOfMonth = (date: DateTypes): string => {
    return dayjs(date).endOf('month').format('YYYY-MM-DD');
};

export const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
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
        previousDay.toLocaleDateString('en-us', { weekday: 'long' }) !==
        'Saturday'
    ) {
        calendarDates.unshift(new Date(previousDay));
        previousDay.setDate(previousDay.getDate() - 1);
    }

    calendarDates.push(
        ...getDatesBetween(firstDayOfTheMonth, lastDayOfTheMonth),
    );

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

const validateDatePattern = (dateString: string) => {
    if (
        !(
            DATE_YYYY_MM_DD_REGEX.test(dateString) ||
            DATE_YYYY_MM_REGEX.test(dateString)
        )
    ) {
        throw new BadRequestException(
            'Invalid month and year string. It must obey the patterns: YYYY-MM-DD or YYYY-MM',
        );
    }
};

export const getYearAndMonthAndDay = (dateString: string): number[] => {
    validateDatePattern(dateString);

    return dateString.split('-').map(Number);
};

export const getYearAndMonth = (dateString: string): number[] => {
    validateDatePattern(dateString);

    return dateString.split('-').map(Number);
};

export const formatDate = (date: DateTypes, template: string): string => {
    return dayjs(date).format(template);
};
