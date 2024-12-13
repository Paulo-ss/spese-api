import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { DATE_MM_DD_YYYY_REGEX } from 'src/common/utils/regex.const';

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  public name: string;

  @IsOptional()
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

  @IsOptional()
  @Matches(DATE_MM_DD_YYYY_REGEX, {
    message: 'A data deve estar no formato MM-dd-yyyy',
  })
  public expenseDate: string;
}
