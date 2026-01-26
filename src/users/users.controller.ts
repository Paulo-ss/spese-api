import { Controller, Get, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@UseGuards(IsAuthenticatedGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    public async getById(@CurrentUser() userId: number): Promise<UserDto> {
        return UserDto.entityToDto(await this.usersService.findOneById(userId));
    }

    @Put('account-setup/confirm')
    public async confirmUserAccountSetup(
        @CurrentUser() userId: number,
    ): Promise<UserDto> {
        return UserDto.entityToDto(
            await this.usersService.finishAccountSetup(userId),
        );
    }
}
