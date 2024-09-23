import {
  Controller,
  Get,
  MessageEvent,
  Sse,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';
import { EventPattern } from '@nestjs/microservices';
import { Observable, concat, from, map } from 'rxjs';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { InvoicesDto } from './dto/invoices.dto';
import { NotificationsDBService } from './notifications-db.service';
import { NotificationType } from './enums/notification-type.enum';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notifcationDBService: NotificationsDBService,
  ) {}

  @UseGuards(IsAuthenticatedGuard)
  @Sse('count')
  public countUnreadNotifications(
    @CurrentUser() userId: number,
  ): Observable<MessageEvent> {
    return concat(
      from(
        this.notifcationDBService.getUnreadNotificationsCountByUser(userId),
      ).pipe(map((count) => ({ data: { unreadCount: count } }))),
      this.notificationsService
        .subscribe(`${userId}.notify`)
        .pipe(
          map((notification) => ({ data: { unreadCount: 1, notification } })),
        ),
    );
  }

  @UseGuards(IsAuthenticatedGuard)
  @Get('user')
  public async getNotificationsByUser(@CurrentUser() userId: number) {
    return this.notifcationDBService.findByUserId(userId);
  }

  @UsePipes(new ValidationPipe())
  @EventPattern({ cmd: 'send-closed-invoices-not' })
  public async emitClosedInvoicesEvent(invoices: InvoicesDto[]) {
    invoices.forEach(async (invoice) => {
      const invoiceDate = new Date(invoice.month);

      const title = `Sua fatura ${invoice.creditCard.nickname} fechou!`;
      const content = `Fatura do mês de ${invoiceDate.toLocaleDateString('pt-br', { month: 'long' })} está fechada, efetue o pagamento até o dia ${invoice.creditCard.dueDay}/${invoiceDate.toLocaleDateString('pt-br', { month: '2-digit' })}.`;

      const notification = await this.notifcationDBService.create({
        userId: invoice.userId,
        title,
        content,
        type: NotificationType.INVOICES,
      });

      this.notificationsService.emit(`${invoice.userId}.notify`, notification);
    });
  }

  @UsePipes(new ValidationPipe())
  @EventPattern({ cmd: 'send-delayed-invoices-not' })
  public async emitDelayedInvoicesEvent(invoices: InvoicesDto[]) {
    invoices.forEach(async (invoice) => {
      const invoiceDate = new Date(invoice.month);

      const title = `Fatura ${invoice.creditCard.nickname} atrasada!`;
      const content = `A fatura do mês de ${invoiceDate.toLocaleDateString('pt-br', { month: 'long' })} está atrasada, efetue o pagamento o quanto antes.`;

      const notification = await this.notifcationDBService.create({
        userId: invoice.userId,
        title,
        content,
        type: NotificationType.INVOICES,
      });

      this.notificationsService.emit(`${invoice.userId}.notify`, notification);
    });
  }
}
