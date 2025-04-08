import { ICreditCard } from './credit-card.interface';
import { InvoiceStatus } from '../enums/invoice-status.enum';
import { IExpense } from 'src/expenses/interfaces/expense.interface';

export interface IInvoice {
  id: number;
  currentPrice: number;
  totalPrice: number;
  creditCard: ICreditCard;
  closingDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  expenses: IExpense[];
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}
