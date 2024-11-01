export interface IUser {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  confirmed: boolean;
  accountSetup: boolean;
  createdAt: string;
  updatedAt: string;
}
