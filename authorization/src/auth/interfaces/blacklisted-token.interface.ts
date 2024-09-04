import { IUser } from 'src/users/interfaces/user.interface';

export interface IBlacklistedToken {
  tokenId: string;
  user: IUser;
  createdAt: string;
}
