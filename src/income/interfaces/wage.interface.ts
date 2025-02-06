import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';
import { WageBusinessDay } from '../enums/wage-business-day.enum';

export interface IWage {
  id: number;
  wage: number;
  paymentDay: number;
  businessDay?: WageBusinessDay;
  bankAccount?: IBankAccount;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
