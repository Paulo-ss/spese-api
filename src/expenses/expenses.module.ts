import { Module, forwardRef } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseEntity } from './entities/expense.entity';
import { CreditCardsModule } from 'src/credit-cards/credit-cards.module';
import { BankAccountsModule } from 'src/bank-accounts/bank-accounts.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseEntity]),
    forwardRef(() => CreditCardsModule),
    BankAccountsModule,
    CategoryModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
