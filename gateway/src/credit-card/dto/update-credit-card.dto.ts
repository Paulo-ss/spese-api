import { Banks } from 'src/bank-account/enums/banks.enum';

export class UpdateCreditCardDto {
  public nickname?: string;
  public bank?: Banks;
  public limit?: number;
  public closingDay?: number;
  public dueDay?: number;
}
