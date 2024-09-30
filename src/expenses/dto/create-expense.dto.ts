import {
  IsDate,
  IsDecimal,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { ExpenseType } from '../enums/expense-type.enum';
import { DATE_MM_DD_YYYY_REGEX } from 'src/common/utils/regex.const';

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

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Digite um valor real R$ válido. Ex: 11.99' },
  )
  public price: number;

  @IsOptional()
  @IsEnum(ExpenseCategory)
  public category?: ExpenseCategory;

  @IsOptional()
  @IsNumber()
  public customCategory?: number;

  @Matches(DATE_MM_DD_YYYY_REGEX, {
    message: 'A data deve estar no formato MM-dd-yyyy',
  })
  public expenseDate: string;
}
