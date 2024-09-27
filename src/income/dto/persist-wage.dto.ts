import { IsNumber } from 'class-validator';

export class PersistWageDto {
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Digite um valor em R$ válido. Ex: 11.99' },
  )
  public wage: number;
}
