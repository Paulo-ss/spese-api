import { Module, forwardRef } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreditCardsController } from './credit-cards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditCard } from './entities/credit-card.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceService } from './invoice.service';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './entities/subscription.entity';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { Expense } from 'src/expenses/entities/expense.entity';
import { BankAccountsModule } from 'src/bank-accounts/bank-accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CreditCard,
      Invoice,
      Subscription,
      Expense,
    ]),
    forwardRef(() => ExpensesModule),
    BankAccountsModule,
  ],
  controllers: [CreditCardsController],
  providers: [CreditCardsService, InvoiceService, SubscriptionService],
  exports: [CreditCardsService, InvoiceService, SubscriptionService],
})
export class CreditCardsModule {}
