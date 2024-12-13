import { Module, forwardRef } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreditCardsController } from './credit-cards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditCardEntity } from './entities/credit-card.entity';
import { InvoiceEntity } from './entities/invoice.entity';
import { InvoiceService } from './invoice.service';
import { SubscriptionService } from './subscription.service';
import { SubscriptionEntity } from './entities/subscription.entity';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CreditCardEntity,
      InvoiceEntity,
      SubscriptionEntity,
      ExpenseEntity,
    ]),
    forwardRef(() => ExpensesModule),
  ],
  controllers: [CreditCardsController],
  providers: [CreditCardsService, InvoiceService, SubscriptionService],
  exports: [CreditCardsService, InvoiceService, SubscriptionService],
})
export class CreditCardsModule {}
