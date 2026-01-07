export interface IUser {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  confirmed: boolean;
  accountSetup: boolean;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}
