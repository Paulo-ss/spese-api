import { Banks } from '../enums/banks.enum';

export class CreateBankAccountDto {
  public bank: Banks;
  public currentBalance?: number;
}
