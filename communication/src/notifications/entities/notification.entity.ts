import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { INotification } from '../interfaces/notification.interface';
import { NotificationType } from '../enums/notification-type.enum';

@Entity({ name: 'notifications' })
export class NotificationEntity implements INotification {
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

  @Column({ name: 'user_id' })
  public userId: number;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
