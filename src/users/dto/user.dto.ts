import { User } from '../entities/user.entity';
import { IResponseUser } from '../interfaces/response-user.interface';

export class UserDto implements IResponseUser {
    public id: number;
    public name: string;
    public username: string;
    public email: string;
    public confirmed: boolean;
    public accountSetup: boolean;
    public createdAt: Date;
    public updatedAt: Date;

    constructor(values: IResponseUser) {
        Object.assign(this, values);
    }

    public static entityToDto(user: User): UserDto {
        return new UserDto({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            confirmed: user.confirmed,
            accountSetup: user.accountSetup,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }
}
