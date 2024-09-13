import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsNumber()
  public id: number;

  @IsOptional()
  @IsString()
  public name: string;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Digite um preço válido. Ex: 11.99' },
  )
  public price: number;

  @IsOptional()
  @IsNumber()
  public creditCardId: number;

  @IsNumber()
  public userId: number;
}
