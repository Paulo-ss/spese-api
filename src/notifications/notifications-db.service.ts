import { Injectable } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { CommonService } from 'src/common/common.service';
import { InvoicesDto } from './dto/invoices.dto';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationsService } from './notifications.service';
import { ReportJobDto } from 'src/analytics/dto/report-job.dto';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationsDBService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly commonService: CommonService,
        private readonly notificationsService: NotificationsService,
    ) {}

    private async findById(id: number): Promise<Notification> {
        const notification = await this.notificationRepository.findById(id);
        this.commonService.checkEntityExistence(notification, 'Notificação');

        return notification;
    }

    public async findByUserId(userId: number): Promise<Notification[]> {
        return await this.notificationRepository.findByUserId(userId);
    }

    public async getUnreadNotificationsCountByUser(
        userId: number,
    ): Promise<number> {
        return await this.notificationRepository.getUnreadCountByUserId(userId);
    }

    public async create(
        createNotificationDto: CreateNotificationDto,
    ): Promise<Notification> {
        return await this.notificationRepository.upsert({
            userId: createNotificationDto.userId,
            type: createNotificationDto.type,
            title: createNotificationDto.title,
            content: createNotificationDto.content,
            referenceId: createNotificationDto.referenceId,
            isRead: false,
        });
    }

    public async markNotificationAsRead(
        id: number,
    ): Promise<IGenericMessageResponse> {
        const notification = await this.findById(id);
        notification.isRead = true;

        await this.notificationRepository.upsert(notification);

        return this.commonService.generateGenericMessageResponse(
            'Notificação lida!',
        );
    }

    public async deleteOneMonthNotifications(): Promise<IGenericMessageResponse> {
        const oneMonthNotifications =
            await this.notificationRepository.findOneMonthOldNotifications();

        await this.notificationRepository.deleteMultiple(oneMonthNotifications);

        return this.commonService.generateGenericMessageResponse(
            'Notificações de 1 mês deletadas',
        );
    }

    public async emitClosedInvoicesEvent(invoices: InvoicesDto[]) {
        for (const invoice of invoices) {
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

            void this.notificationsService.emit(
                `${invoice.userId}.notify`,
                notification,
            );
        }
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

            this.notificationsService.emit(
                `${invoice.userId}.notify`,
                notification,
            );
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
