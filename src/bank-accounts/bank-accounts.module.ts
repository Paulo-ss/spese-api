import { forwardRef, Module } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { BankAccountsController } from './bank-accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountEntity } from './entities/bank.entity';
import { IncomeModule } from 'src/income/income.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BankAccountEntity]),
    forwardRef(() => IncomeModule),
  ],
  controllers: [BankAccountsController],
  providers: [BankAccountsService],
  exports: [BankAccountsService],
})
export class BankAccountsModule {}
