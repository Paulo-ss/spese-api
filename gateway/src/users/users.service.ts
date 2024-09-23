import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserDto } from './dto/user.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject('AUTHORIZATION') private readonly authorizationClient: ClientProxy,
  ) {}

  public async getById(userId: number): Promise<UserDto> {
    const response: UserDto = await firstValueFrom(
      this.authorizationClient.send({ cmd: 'get-by-id' }, { userId }),
    );

    return response;
  }
}
