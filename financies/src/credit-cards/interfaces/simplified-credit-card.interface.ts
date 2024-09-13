import { Banks } from 'src/bank-accounts/enums/banks.enum';

export interface SimplifiedCreditCardInterface {
  id: number;
  nickname: string;
  currentMonthInvoiceTotal: number;
  otherMonthsTotal: number;
  closedTotal: number;
  bank: Banks;
  dueDay: number;
  limit: number;
}
