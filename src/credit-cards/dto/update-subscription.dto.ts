import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateSubscriptionDto {
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

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  public billingDay: number;
}
