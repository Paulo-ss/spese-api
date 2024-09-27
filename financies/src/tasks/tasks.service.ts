import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportsService } from 'src/analytics/reports.service';
import { InvoiceService } from 'src/credit-cards/invoice.service';

@Injectable()
export class TasksService {
  constructor(
    @Inject('COMMUNICATIONS')
    private readonly communicationsClient: ClientProxy,
    private readonly invoiceService: InvoiceService,
    private readonly reportsService: ReportsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  public async closeInvoices() {
    const closedInvoices = await this.invoiceService.closeInvoices();

    this.communicationsClient.emit(
      { cmd: 'send-closed-invoices-not' },
      closedInvoices,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  public async markInvoicesAsDelayed() {
    const delayedInvoices = await this.invoiceService.markInvoicesAsDelayed();

    this.communicationsClient.emit(
      { cmd: 'send-delayed-invoices-not' },
      delayedInvoices,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  public async deleteReportsOlderThanOneDay() {
    await this.reportsService.deleteReportsOlderThanOneDay();
  }
}
