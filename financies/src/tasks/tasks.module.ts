import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreditCardsModule } from 'src/credit-cards/credit-cards.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AnalyticsModule } from 'src/analytics/analytics.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'COMMUNICATIONS',
        transport: Transport.TCP,
        options: { port: 8081, host: 'communication' },
      },
    ]),
    CreditCardsModule,
    AnalyticsModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
