import { Banks } from 'src/bank-account/enums/banks.enum';

export class CreateCreditCardDto {
  public nickname: string;
  public bank: Banks;
  public limit: number;
  public closingDay: number;
  public dueDay: number;
}
