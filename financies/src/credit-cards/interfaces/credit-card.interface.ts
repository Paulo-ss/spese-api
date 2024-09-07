import { Banks } from '../../bank-accounts/enums/banks.enum';

export interface ICreditCard {
  id: number;
  nickname: string;
  bank: Banks;
  userId: number;
  dueDate: Date;
  closingDate: Date;
  createdAt: Date;
  updatedAt: Date;
  limit?: number;
}
