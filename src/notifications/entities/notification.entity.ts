import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { INotification } from '../interfaces/notification.interface';
import { NotificationType } from '../enums/notification-type.enum';
import { VersionedUserEntityBase } from '../../common/entities/versioned-user-base.entity';

@Entity({ name: 'notifications' })
export class Notification
    extends VersionedUserEntityBase
    implements INotification
{
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'title' })
    public title: string;

    @Column({ name: 'content' })
    public content: string;

    @Column({ name: 'reference_id' })
    public referenceId: number;

    @Column('enum', { name: 'type', enum: NotificationType })
    public type: NotificationType;

    @Column({ name: 'is_read' })
    public isRead: boolean;
}
