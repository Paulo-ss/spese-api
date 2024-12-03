import { ICreditCard } from './credit-card.interface';

export interface ISubscription {
  id: number;
  name: string;
  price: number;
  creditCard: ICreditCard;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
