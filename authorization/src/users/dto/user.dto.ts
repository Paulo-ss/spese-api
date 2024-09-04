import { UserEntity } from '../entities/user.entity';
import { IResponseUser } from '../interfaces/response-user.interface';

export class UserDto implements IResponseUser {
  public id: number;
  public name: string;
  public username: string;
  public email: string;
  public confirmed: boolean;
  public createdAt: string;
  public updatedAt: string;

  constructor(values: IResponseUser) {
    Object.assign(this, values);
  }

  public static entityToDto(user: UserEntity): UserDto {
    return new UserDto({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      confirmed: user.confirmed,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
