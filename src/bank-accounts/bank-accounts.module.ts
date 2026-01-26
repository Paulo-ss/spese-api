import { forwardRef, Module } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { BankAccountsController } from './bank-accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccount } from './entities/bank.entity';
import { IncomeModule } from 'src/income/income.module';
import { BankAccountRepository } from './bank-account.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([BankAccount]),
        forwardRef(() => IncomeModule),
    ],
    controllers: [BankAccountsController],
    providers: [BankAccountsService, BankAccountRepository],
    exports: [BankAccountsService],
})
export class BankAccountsModule {}
