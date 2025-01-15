import { ICreditCard } from 'src/credit-cards/interfaces/credit-card.interface';
import { ExpenseType } from '../enums/expense-type.enum';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { ISubscription } from 'src/credit-cards/interfaces/subscription.interface';
import { IInvoice } from 'src/credit-cards/interfaces/invoice.interface';
import { ICategory } from 'src/category/interfaces/category.interface';

export interface IExpense {
  id: number;
  userId: number;
  expenseType: ExpenseType;
  name: string;
  price: number;
  status: ExpenseStatus;
  expenseDate: Date;
  updatedAt: Date;
  category?: ExpenseCategory;
  customCategory?: ICategory;
  bankAccount?: IBankAccount;
  creditCard?: ICreditCard;
  invoice?: IInvoice;
  subscription?: ISubscription;
  installmentNumber?: number;
  totalInstallments?: number;
}
