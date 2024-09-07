import { ICreditCard } from './credit-card.interface';

export interface IInvoice {
  id: number;
  currentPrice: number;
  creditCard: ICreditCard;
  invoiceDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
