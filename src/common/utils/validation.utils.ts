interface Length {
    length: number;
}

export const isUndefined = (value: unknown): value is undefined =>
    value === undefined;

export const isNull = (value: unknown): value is null => value === null;

export const isEmpty = (iterable: Length): boolean => {
    return iterable.length === 0;
};

export const isNullOrUndefined = (value: unknown): boolean => {
    return isUndefined(value) || isNull(value);
};
