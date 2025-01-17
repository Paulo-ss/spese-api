import { Banks } from 'src/bank-accounts/enums/banks.enum';

export interface SimplifiedCreditCardInterface {
  id: number;
  nickname: string;
  currentMonthInvoiceTotal: number;
  otherMonthsTotal: number;
  lastFourDigits: string;
  closedTotal: number;
  bank: Banks;
  closingDate: Date;
  dueDate: Date;
  limit: number;
}
