import { IsDecimal, IsNumber } from 'class-validator';

export class PersistWageDto {
  @IsNumber()
  @IsDecimal()
  public wage: number;

  @IsNumber()
  public userId: number;
}
