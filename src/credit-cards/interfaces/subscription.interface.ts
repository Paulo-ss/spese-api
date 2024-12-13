import { IExpense } from 'src/expenses/interfaces/expense.interface';
import { ICreditCard } from './credit-card.interface';

export interface ISubscription {
  id: number;
  name: string;
  price: number;
  creditCard: ICreditCard;
  billingDay: number;
  expenses: IExpense[];
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
