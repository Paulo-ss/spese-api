import { IsNumber, IsString } from 'class-validator';

export class CreateIncomeDto {
  @IsString()
  public name: string;

  @IsNumber()
  public value: number;

  @IsString()
  public incomeMonth: string;

  @IsNumber()
  public userId: number;
}
