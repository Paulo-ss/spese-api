import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsDBService } from './notifications-db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationRepository } from './notification.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
    controllers: [NotificationsController],
    providers: [
        NotificationsService,
        NotificationsDBService,
        NotificationRepository,
    ],
    exports: [NotificationsDBService, NotificationsService],
})
export class NotificationsModule {}
