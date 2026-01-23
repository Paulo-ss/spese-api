import { NotificationType } from '../enums/notification-type.enum';
import { IVersionedUserEntityBase } from '../../common/interfaces/versioned-user-entity-base.interface';

export interface INotification extends IVersionedUserEntityBase {
    id: number;
    title: string;
    content: string;
    referenceId: number;
    type: NotificationType;
    isRead: boolean;
}
