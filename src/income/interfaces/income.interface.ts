import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';
import { IWage } from './wage.interface';

export interface IIncome {
  id: number;
  name: string;
  value: number;
  bankAccount?: IBankAccount;
  wage?: IWage;
  userId: number;
  incomeMonth: Date;
  updatedAt: Date;
}
