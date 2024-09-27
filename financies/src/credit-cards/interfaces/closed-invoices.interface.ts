import { ICreditCard } from './credit-card.interface';

export interface IClosedInvoices {
  invoiceId: number;
  userId: number;
  creditCard: ICreditCard;
  month: string;
}
