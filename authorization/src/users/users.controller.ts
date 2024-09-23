import {
  Controller,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern } from '@nestjs/microservices';
import { UserDto } from './dto/user.dto';
import { RcpExceptionFilter } from 'src/filters/rcp-exception.filter';

@UseFilters(RcpExceptionFilter)
@UsePipes(new ValidationPipe())
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'get-by-id' })
  public async getById({ userId }: { userId: number }): Promise<UserDto> {
    const user = await this.usersService.findOneById(userId);

    return UserDto.entityToDto(user);
  }
}
