import { IsNumber } from 'class-validator';

export class UpdateBankAccountDto {
  @IsNumber()
  public currentBalance: number;
}
