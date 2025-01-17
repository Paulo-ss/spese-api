import { IExpense } from 'src/expenses/interfaces/expense.interface';
import { Banks } from '../../bank-accounts/enums/banks.enum';
import { ISubscription } from './subscription.interface';

export interface ICreditCard {
  id: number;
  nickname: string;
  bank: Banks;
  userId: number;
  dueDay: number;
  closingDay: number;
  lastFourDigits: string;
  createdAt: Date;
  updatedAt: Date;
  limit?: number;
  expenses?: IExpense[];
  subscriptions?: ISubscription[];
}
