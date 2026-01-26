export class NumericColumnTransformer {
    to(data: number): number {
        return data;
    }

    from(data: string): number {
        return Number.parseFloat(data);
    }
}
