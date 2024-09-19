import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class NotificationsDBService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationReporsitory: Repository<NotificationEntity>,
    private readonly commonService: CommonService,
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
}
