import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportsService } from 'src/analytics/reports.service';
import { InvoiceService } from 'src/credit-cards/invoice.service';
import { NotificationsDBService } from 'src/notifications/notifications-db.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly notificationsDBService: NotificationsDBService,
    private readonly invoiceService: InvoiceService,
    private readonly reportsService: ReportsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  public async closeInvoices() {
    const closedInvoices = await this.invoiceService.closeInvoices();

    this.notificationsDBService.emitClosedInvoicesEvent(closedInvoices);
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  public async markInvoicesAsDelayed() {
    const delayedInvoices = await this.invoiceService.markInvoicesAsDelayed();

    this.notificationsDBService.emitDelayedInvoicesEvent(delayedInvoices);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  public async deleteOneMonthNotifications() {
    this.notificationsDBService.deleteOneMonthNotifications();
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  public async deleteReportsOlderThanOneDay() {
    await this.reportsService.deleteReportsOlderThanOneDay();
  }
}
