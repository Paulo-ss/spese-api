import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InvoiceService {
  constructor(
    @Inject('FINANCIES') private readonly financiesClient: ClientProxy,
  ) {}

  public async findById(invoiceId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'invoice-by-id' }, invoiceId),
    );

    return response;
  }

  public async payInvoice(invoiceId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'pay-invoice' }, invoiceId),
    );

    return response;
  }
}
