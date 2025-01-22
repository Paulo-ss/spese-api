import {
  IsInstance,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { DATE_MM_DD_YYYY_REGEX } from 'src/common/utils/regex.const';
import { WageEntity } from '../entities/wage.entity';

export class CreateIncomeDto {
  @IsString({ message: 'Digite um nome.' })
  public name: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Digite um valor de R$ válido. Ex: 11.99' },
  )
  public value: number;

  @Matches(DATE_MM_DD_YYYY_REGEX, {
    message: 'A data deve estar no padrão MM-dd-yyyy',
  })
  public incomeMonth: string;

  @IsOptional()
  @IsNumber()
  public bankAccountId?: number;

  @IsOptional()
  @IsNumber()
  public userId?: number;

  @IsOptional()
  @IsInstance(WageEntity)
  public wage?: WageEntity;
}
