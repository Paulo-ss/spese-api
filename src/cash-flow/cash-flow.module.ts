import { forwardRef, Module } from '@nestjs/common';
import { CashFlowService } from './cash-flow.service';
import { CashFlowController } from './cash-flow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowDayEntity } from './entities/cash-flow-daily.entity';
import { BankAccountsModule } from 'src/bank-accounts/bank-accounts.module';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { IncomeModule } from 'src/income/income.module';
import { CreditCardsModule } from 'src/credit-cards/credit-cards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashFlowDayEntity]),
    BankAccountsModule,
    forwardRef(() => ExpensesModule),
    IncomeModule,
    CreditCardsModule,
  ],
  controllers: [CashFlowController],
  providers: [CashFlowService],
  exports: [CashFlowService],
})
export class CashFlowModule {}
