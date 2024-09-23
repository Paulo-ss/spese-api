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
import { CurrentUser } from 'src/decorators/current-user.decorator';

@UseGuards(IsAuthenticatedGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  public async getById(@CurrentUser() userId: number): Promise<UserDto> {
    return this.usersService.getById(Number(userId));
  }
}
