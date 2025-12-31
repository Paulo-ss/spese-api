import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';

export interface IIncome {
  id: number;
  name: string;
  value: number;
  bankAccount?: IBankAccount;
  userId: number;
  incomeMonth: Date;
  updatedAt: Date;
}
