import { Banks } from '../enums/banks.enum';

export interface IBankAccount {
  id: number;
  bank: Banks;
  currentBalance?: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
