import { ICreditCard } from './credit-card.interface';
import { InvoiceStatus } from '../enums/invoice-status.enum';

export interface IInvoice {
  id: number;
  currentPrice: number;
  creditCard: ICreditCard;
  closingDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}
