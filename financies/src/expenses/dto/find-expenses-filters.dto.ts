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
  @IsString()
  public fromMonth: string;

  @IsOptional()
  @IsString()
  public toMonth?: string;

  @IsOptional()
  @IsEnum(ExpenseCategory)
  public category?: ExpenseCategory;

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
}
