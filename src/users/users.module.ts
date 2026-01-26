import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UserRepository } from './user.repository';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UsersService, UserRepository],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {}
