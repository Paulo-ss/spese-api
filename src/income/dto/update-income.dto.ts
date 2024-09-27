import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateIncomeDto {
  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsNumber()
  public value?: number;

  @IsOptional()
  @IsString()
  public incomeMonth?: string;
}
