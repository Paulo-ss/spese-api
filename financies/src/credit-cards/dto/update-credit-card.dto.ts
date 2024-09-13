import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Banks } from 'src/bank-accounts/enums/banks.enum';

export class UpdateCreditCardDto {
  @IsNumber()
  public creditCardId: number;

  @IsOptional()
  @IsString()
  public nickname?: string;

  @IsOptional()
  @IsEnum(Banks, {
    message: 'O banco deve ser NuBank, Inter, Itaú ou Bradesco.',
  })
  public bank?: Banks;

  @IsOptional()
  @IsNumber()
  public limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  public closingDay?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  public dueDay?: number;

  @IsNumber()
  public userId: number;
}
