import { IExpense } from 'src/expenses/interfaces/expense.interface';
import { ICreditCard } from './credit-card.interface';

export interface IInstallment {
  id: number;
  expense: IExpense;
  creditCard: ICreditCard;
  installmentNumber: number;
  createdAt: Date;
  updatedAt: Date;
}
