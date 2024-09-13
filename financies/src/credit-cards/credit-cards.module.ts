import { Module } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreditCardsController } from './credit-cards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditCardEntity } from './entities/credit-card.entity';
import { InstallmentEntity } from './entities/installment.entity';
import { InvoiceEntity } from './entities/invoice.entity';
import { InstallmentService } from './installment.service';
import { InvoiceService } from './invoice.service';
import { SubscriptionService } from './subscription.service';
import { SubscriptionEntity } from './entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CreditCardEntity,
      InstallmentEntity,
      InvoiceEntity,
      SubscriptionEntity,
    ]),
  ],
  controllers: [CreditCardsController],
  providers: [
    CreditCardsService,
    InstallmentService,
    InvoiceService,
    SubscriptionService,
  ],
  exports: [CreditCardsService, InstallmentService, InvoiceService],
})
export class CreditCardsModule {}
