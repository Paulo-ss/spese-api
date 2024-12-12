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

  @Cron('0 0 1 11,26 * *', { timeZone: 'America/Sao_Paulo' })
  public async closeInvoices() {
    const closedInvoices = await this.invoiceService.closeInvoices();

    this.notificationsDBService.emitClosedInvoicesEvent(closedInvoices);
  }

  @Cron('0 0 1 2-4,18-20 * *', { timeZone: 'America/Sao_Paulo' })
  public async markInvoicesAsDelayed() {
    const delayedInvoices = await this.invoiceService.markInvoicesAsDelayed();

    this.notificationsDBService.emitDelayedInvoicesEvent(delayedInvoices);
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    timeZone: 'America/Sao_Paulo',
  })
  public async deleteOneMonthNotifications() {
    this.notificationsDBService.deleteOneMonthNotifications();
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, { timeZone: 'America/Sao_Paulo' })
  public async deleteReportsOlderThanOneDay() {
    await this.reportsService.deleteReportsOlderThanOneDay();
  }
}
