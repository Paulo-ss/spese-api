import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoiceService } from 'src/credit-cards/invoice.service';

@Injectable()
export class TasksService {
  constructor(
    @Inject('COMMUNICATIONS')
    private readonly communicationsClient: ClientProxy,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async closeInvoices() {
    const closedInvoices = await this.invoiceService.closeInvoices();

    this.communicationsClient.emit(
      { cmd: 'send-closed-invoices-not' },
      closedInvoices,
    );
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async markInvoicesAsDelayed() {
    const delayedInvoices = await this.invoiceService.markInvoicesAsDelayed();

    this.communicationsClient.emit(
      { cmd: 'send-delayed-invoices-not' },
      delayedInvoices,
    );
  }
}
