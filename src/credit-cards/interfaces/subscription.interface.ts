import { ICreditCard } from './credit-card.interface';

export interface ISubscription {
  id: number;
  name: string;
  price: number;
  creditCard: ICreditCard;
  createdAt: Date;
  updatedAt: Date;
}
