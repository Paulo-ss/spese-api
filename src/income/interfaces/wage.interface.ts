import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';
import { WageBusinessDay } from '../enums/wage-business-day.enum';

export interface IWage {
  id: number;
  wage: number;
  paymmentDay: number;
  businessDay?: WageBusinessDay;
  bankAccount?: IBankAccount;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
