import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseEntity } from './entities/expense.entity';
import { CreditCardsModule } from 'src/credit-cards/credit-cards.module';
import { BankAccountsModule } from 'src/bank-accounts/bank-accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseEntity]),
    CreditCardsModule,
    BankAccountsModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
