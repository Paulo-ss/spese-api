import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [TasksService],
})
export class TasksModule {}
