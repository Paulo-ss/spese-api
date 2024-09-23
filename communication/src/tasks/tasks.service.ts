import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsDBService } from 'src/notifications/notifications-db.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly notificationsDBService: NotificationsDBService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  public async deleteOneMonthNotifications() {
    this.notificationsDBService.deleteOneMonthNotifications();
  }
}
