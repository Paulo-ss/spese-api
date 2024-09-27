import { ICreditCard } from './credit-card.interface';

export interface IInvoices {
  invoiceId: number;
  userId: number;
  creditCard: ICreditCard;
  month: string;
}
