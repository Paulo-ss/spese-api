import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateIncomeDto {
  @IsNumber()
  public incomeId: number;

  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsNumber()
  public value?: number;

  @IsOptional()
  @IsString()
  public incomeMonth?: string;

  @IsNumber()
  public userId: number;
}
