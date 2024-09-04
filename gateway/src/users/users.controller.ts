import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import { UserDto } from './dto/user.dto';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';

@UseGuards(IsAuthenticatedGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  public async getAll(@Res() response: Response): Promise<UserDto[]> {
    const users = await this.usersService.getAll();

    if (users.length === 0) {
      response.status(HttpStatus.NO_CONTENT).send();
    }

    return users;
  }

  @Get(':id')
  public async getById(@Param() params: { id: string }): Promise<UserDto> {
    return this.usersService.getById(Number(params.id));
  }
}
