import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { ExpenseStatus } from '../enums/expense-status.enum';

export class FindExpensesFiltersDto {
  @IsOptional()
  @IsString()
  public month?: string;

  @IsOptional()
  @IsString()
  public fromDate?: string;

  @IsOptional()
  @IsString()
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
}
