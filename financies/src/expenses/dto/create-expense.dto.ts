import {
  IsDate,
  IsDecimal,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { ExpenseType } from '../enums/expense-type.enum';

export class CreateExpenseDto {
  @IsOptional()
  @IsNumber()
  public bankAccountId?: number;

  @IsOptional()
  @IsNumber()
  public creditCardId?: number;

  @IsEnum(ExpenseType)
  public expenseType: ExpenseType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  public installments?: number;

  @IsString()
  public name: string;

  @IsNumber()
  @IsDecimal()
  public price: number;

  @IsEnum(ExpenseStatus)
  public status: ExpenseStatus;

  @IsOptional()
  @IsEnum(ExpenseCategory)
  public category?: ExpenseCategory;

  @IsNumber()
  public userId: number;

  @IsDate()
  public expenseDate: Date;
}
