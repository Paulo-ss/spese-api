export const isUndefined = (value: unknown): value is undefined =>
  typeof value === 'undefined';

export const isNull = (value: unknown): value is null => value === null;

export const DATE_MM_DD_YYYY_REGEX = /\d{2}-\d{2}-\d{4}/;
