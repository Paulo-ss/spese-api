import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { CommonService } from 'src/common/common.service';
import { InvoicesDto } from './dto/invoices.dto';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationsService } from './notifications.service';
import { ReportJobDto } from './dto/report-job.dto';

@Injectable()
export class NotificationsDBService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationReporsitory: Repository<NotificationEntity>,
    private readonly commonService: CommonService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async findById(id: number): Promise<NotificationEntity> {
    const notification = await this.notificationReporsitory.findOneBy({ id });
    this.commonService.checkEntityExistence(notification, 'Notificação');

    return notification;
  }

  public async findByUserId(userId: number): Promise<NotificationEntity[]> {
    return await this.notificationReporsitory.find({
      where: { userId },
      order: {
        createdAt: { direction: 'DESC' },
        isRead: { direction: 'DESC' },
      },
    });
  }

  public async getUnreadNotificationsCountByUser(
    userId: number,
  ): Promise<number> {
    return await this.notificationReporsitory.countBy({
      isRead: false,
      userId,
    });
  }

  public async create(
    createNotifcationDto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    const notification = this.notificationReporsitory.create({
      userId: createNotifcationDto.userId,
      type: createNotifcationDto.type,
      title: createNotifcationDto.title,
      content: createNotifcationDto.content,
      referenceId: createNotifcationDto.referenceId,
      isRead: false,
    });

    await this.commonService.throwInternalError(
      this.commonService.saveEntity(this.notificationReporsitory, notification),
    );

    return notification;
  }

  public async markNotificationAsRead(
    id: number,
  ): Promise<IGenericMessageResponse> {
    const notification = await this.findById(id);
    notification.isRead = true;

    await this.commonService.saveEntity(
      this.notificationReporsitory,
      notification,
    );

    return this.commonService.generateGenericMessageResponse(
      'Notificação lida!',
    );
  }

  public async deleteOneMonthNotifications(): Promise<IGenericMessageResponse> {
    const today = new Date();
    today.setMonth(today.getMonth() - 1);

    const oneMonthAgo = new Date(today).toISOString().split('T')[0];

    const oneMonthNotifications = await this.notificationReporsitory
      .createQueryBuilder('n')
      .where('n.created_at = :oneMonthAgo', { oneMonthAgo })
      .getMany();

    await this.commonService.removeMultipleEntities(
      this.notificationReporsitory,
      oneMonthNotifications,
    );

    return this.commonService.generateGenericMessageResponse(
      'Notificações de 1 mês deletadas',
    );
  }

  public async emitClosedInvoicesEvent(invoices: InvoicesDto[]) {
    invoices.forEach(async (invoice) => {
      const invoiceDate = new Date(invoice.month);

      const title = `Sua fatura ${invoice.creditCard.nickname} fechou!`;
      const content = `Fatura do mês de ${invoiceDate.toLocaleDateString('pt-br', { month: 'long' })} está fechada, efetue o pagamento até o dia ${invoice.creditCard.dueDay}/${invoiceDate.toLocaleDateString('pt-br', { month: '2-digit' })}.`;

      const notification = await this.create({
        userId: invoice.userId,
        title,
        content,
        referenceId: invoice.invoiceId,
        type: NotificationType.INVOICES,
      });

      this.notificationsService.emit(`${invoice.userId}.notify`, notification);
    });
  }

  public async emitDelayedInvoicesEvent(invoices: InvoicesDto[]) {
    invoices.forEach(async (invoice) => {
      const invoiceDate = new Date(invoice.month);

      const title = `Fatura ${invoice.creditCard.nickname} atrasada!`;
      const content = `A fatura do mês de ${invoiceDate.toLocaleDateString('pt-br', { month: 'long' })} está atrasada, efetue o pagamento o quanto antes.`;

      const notification = await this.create({
        userId: invoice.userId,
        title,
        content,
        referenceId: invoice.invoiceId,
        type: NotificationType.INVOICES,
      });

      this.notificationsService.emit(`${invoice.userId}.notify`, notification);
    });
  }

  public async emitReportDoneNotification(report: ReportJobDto) {
    const title = `Relatório pronto!`;
    const content = `O seu relatório solicitado do mês ${report.month.replace('-', '/')} ficou pronto, clique aqui para baixar.`;

    const notification = await this.create({
      userId: report.userId,
      title,
      content,
      referenceId: report.reportId,
      type: NotificationType.REPORTS,
    });

    this.notificationsService.emit(`${report.userId}.notify`, notification);
  }
}
