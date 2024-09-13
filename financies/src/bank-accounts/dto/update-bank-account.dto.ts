import { IsNumber } from 'class-validator';

export class UpdateBankAccountDto {
  @IsNumber()
  public bankAccountId: number;

  @IsNumber()
  public currentBalance: number;

  @IsNumber()
  public userId: number;
}
