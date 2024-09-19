export interface ICreditCard {
  id: number;
  nickname: string;
  userId: number;
  dueDay: number;
  closingDay: number;
  createdAt: Date;
  updatedAt: Date;
  limit?: number;
}
