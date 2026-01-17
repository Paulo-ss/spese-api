import {
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { ExpenseType } from '../enums/expense-type.enum';
import {
    DATE_YYYY_MM_DD_REGEX,
    DATE_YYYY_MM_REGEX,
} from '../../common/utils/regex.const';

export class FindExpensesFiltersDto {
    @IsOptional()
    @IsString()
    @Matches(DATE_YYYY_MM_REGEX, {
        message: 'A data deve estar no formato YYYY-MM.',
    })
    public month?: string;

    @IsOptional()
    @IsString()
    @Matches(DATE_YYYY_MM_DD_REGEX, {
        message: 'A data deve estar no formato YYYY-MM-DD.',
    })
    public fromDate?: string;

    @IsOptional()
    @IsString()
    @Matches(DATE_YYYY_MM_DD_REGEX, {
        message: 'A data deve estar no formato YYYY-MM-DD.',
    })
    public toDate?: string;

    @IsOptional()
    @IsEnum(ExpenseCategory)
    public category?: ExpenseCategory;

    @IsOptional()
    @IsNumber()
    public customCategory?: number;

    @IsOptional()
    @IsString()
    public name?: string;

    @IsOptional()
    @IsArray()
    public priceRange?: number[];

    @IsOptional()
    @IsEnum(ExpenseStatus)
    public status?: ExpenseStatus;

    @IsOptional()
    @IsNumber()
    public creditCardId?: number;

    @IsOptional()
    @IsNumber()
    public userId: number;

    @IsOptional()
    @IsEnum(ExpenseType)
    public type?: ExpenseType;
}
