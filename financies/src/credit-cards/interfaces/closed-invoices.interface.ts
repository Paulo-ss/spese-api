import { ICreditCard } from './credit-card.interface';

export interface IClosedInvoices {
  userId: number;
  creditCard: ICreditCard;
  month: string;
}
