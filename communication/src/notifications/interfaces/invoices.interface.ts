import { ICreditCard } from './credit-card.interface';

export interface IInvoices {
  userId: number;
  creditCard: ICreditCard;
  month: string;
}
