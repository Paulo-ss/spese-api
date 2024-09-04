import { IResponseUser } from 'src/users/interfaces/response-user.interface';

export interface IAuthResult {
  user: IResponseUser;
  accessToken: string;
  refreshToken: string;
}
