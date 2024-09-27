import { IExpense } from 'src/expenses/interfaces/expense.interface';
import { Banks } from '../enums/banks.enum';

export interface IBankAccount {
  id: number;
  bank: Banks;
  currentBalance?: number;
  expenses?: IExpense[];
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
