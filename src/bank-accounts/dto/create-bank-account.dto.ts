import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Banks } from '../enums/banks.enum';

export class CreateBankAccountDto {
  @IsEnum(Banks, {
    message: 'O banco deve ser NuBank, Inter, Itáu ou Bradesco.',
  })
  public bank: Banks;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Digite um valor válido.' })
  public currentBalance?: number;
}
