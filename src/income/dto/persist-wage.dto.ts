import { IsNumber, Max, Min } from 'class-validator';

export class PersistWageDto {
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Digite um valor em R$ válido. Ex: 11.99' },
  )
  public wage: number;

  @IsNumber({}, { message: 'Informe um número entre 1 a 31' })
  @Min(1, { message: 'Informe um número entre 1 a 31' })
  @Max(31, { message: 'Informe um número entre 1 a 31' })
  public paymmentDay: number;
}
