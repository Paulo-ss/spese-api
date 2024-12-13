import { IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  public name: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Digite um preço válido. Ex: 11.99' },
  )
  public price: number;

  @IsNumber()
  public creditCardId: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  public billingDay: number;
}
