import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { Notification } from './entities/notification.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DeepPartial } from 'typeorm';
import { formatDate, getToday } from '../common/utils/dates.utils';

@Injectable()
export class NotificationRepository extends BaseRepository<Notification> {
    constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
        super(txHost, Notification);
    }

    public async findById(id: number): Promise<Notification> {
        return await this.repository.findOneBy({ id });
    }

    public async findByUserId(userId: number): Promise<Notification[]> {
        return await this.repository.find({
            where: { userId },
            order: {
                createdAt: { direction: 'DESC' },
                isRead: { direction: 'ASC' },
            },
        });
    }

    public async getUnreadCountByUserId(userId: number): Promise<number> {
        return await this.repository.countBy({
            isRead: false,
            userId,
        });
    }

    public async findOneMonthOldNotifications(): Promise<Notification[]> {
        const oneMonthAgo = formatDate(
            getToday().subtract(1, 'month'),
            'YYYY-MM-DD',
        );

        return await this.repository
            .createQueryBuilder('n')
            .where('n.created_at = :oneMonthAgo', { oneMonthAgo })
            .getMany();
    }

    public async upsert(
        notification: DeepPartial<Notification>,
    ): Promise<Notification> {
        return await this.repository.save(this.repository.create(notification));
    }

    public async deleteMultiple(notifications: Notification[]): Promise<void> {
        await this.repository.remove(notifications);
    }
}
