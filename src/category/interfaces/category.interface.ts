import { IExpense } from 'src/expenses/interfaces/expense.interface';

export interface ICategory {
  id: number;
  name: string;
  color: string;
  userId: number;
  expenses?: IExpense[];
  createdAt: Date;
  updatedAt: Date;
}
