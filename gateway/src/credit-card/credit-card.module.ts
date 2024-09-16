import { Module } from '@nestjs/common';
import { CreditCardService } from './credit-card.service';
import { CreditCardController } from './credit-card.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SubscriptionService } from './subscription.service';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'FINANCIES',
        transport: Transport.TCP,
        options: { port: 8082, host: 'financies' },
      },
    ]),
  ],
  controllers: [CreditCardController],
  providers: [CreditCardService, SubscriptionService, InvoiceService],
})
export class CreditCardModule {}
