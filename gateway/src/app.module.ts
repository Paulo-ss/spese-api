import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BankAccountModule } from './bank-account/bank-account.module';

@Module({
  imports: [UsersModule, AuthModule, BankAccountModule],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
