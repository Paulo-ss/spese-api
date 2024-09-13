import { Module, forwardRef } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseEntity } from './entities/expense.entity';
import { CreditCardsModule } from 'src/credit-cards/credit-cards.module';
import { BankAccountsModule } from 'src/bank-accounts/bank-accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseEntity]),
    forwardRef(() => CreditCardsModule),
    BankAccountsModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
