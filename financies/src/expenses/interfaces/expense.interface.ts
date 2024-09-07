import { ICreditCard } from 'src/credit-cards/interfaces/credit-card.interface';
import { ExpenseType } from '../enums/expense-type.enum';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';

export interface IExpense {
  id: number;
  userId: number;
  expenseType: ExpenseType;
  name: string;
  price: number;
  status: ExpenseStatus;
  monthly: boolean;
  createdAt: Date;
  updatedAt: Date;
  bankAccount?: IBankAccount;
  creditCard?: ICreditCard;
  installments?: number;
}
