import { IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { DATE_MM_DD_YYYY_REGEX } from 'src/common/utils/regex.const';

export class UpdateIncomeDto {
  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Digite um valor de R$ válido. Ex: 11.99' },
  )
  public value?: number;

  @IsOptional()
  @Matches(DATE_MM_DD_YYYY_REGEX, {
    message: 'A data deve estar no padrão MM-dd-yyyy',
  })
  public incomeMonth?: string;
}
