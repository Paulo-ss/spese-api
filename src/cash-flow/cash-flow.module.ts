import { forwardRef, Module } from '@nestjs/common';
import { CashFlowService } from './cash-flow.service';
import { CashFlowController } from './cash-flow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowByDay } from './entities/cash-flow-by-day.entity';
import { BankAccountsModule } from 'src/bank-accounts/bank-accounts.module';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { IncomeModule } from 'src/income/income.module';
import { CreditCardsModule } from 'src/credit-cards/credit-cards.module';
import { CashFlowByDayRepository } from './cash-flow-by-day.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([CashFlowByDay]),
        forwardRef(() => BankAccountsModule),
        forwardRef(() => ExpensesModule),
        forwardRef(() => IncomeModule),
        forwardRef(() => CreditCardsModule),
    ],
    controllers: [CashFlowController],
    providers: [CashFlowService, CashFlowByDayRepository],
    exports: [CashFlowService],
})
export class CashFlowModule {}
