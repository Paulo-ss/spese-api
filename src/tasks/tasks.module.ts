import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { CreditCardsModule } from 'src/credit-cards/credit-cards.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';

@Module({
  imports: [NotificationsModule, CreditCardsModule, AnalyticsModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
