import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { WageBusinessDay } from '../enums/wage-business-day.enum';

export class PersistWageDto {
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Digite um valor em R$ válido. Ex: 11.99' },
  )
  public wage: number;

  @IsNumber({}, { message: 'Informe um número entre 1 a 31' })
  @Min(1, { message: 'Informe um número entre 1 a 31' })
  @Max(31, { message: 'Informe um número entre 1 a 31' })
  public paymentDay: number;

  @IsEnum(WageBusinessDay)
  public businessDay: WageBusinessDay;

  @IsOptional()
  @IsNumber()
  public bankAccountId?: number;
}
