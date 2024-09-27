import { IsEnum, IsNumber, IsString, Max, Min } from 'class-validator';
import { Banks } from 'src/bank-accounts/enums/banks.enum';

export class CreateCreditCardDto {
  @IsString()
  public nickname: string;

  @IsEnum(Banks, {
    message: 'O banco deve ser NuBank, Inter, Itaú ou Bradesco.',
  })
  public bank: Banks;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Digite um valor em R$ válido. Ex: 11.99' },
  )
  public limit: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  public closingDay: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  public dueDay: number;
}
