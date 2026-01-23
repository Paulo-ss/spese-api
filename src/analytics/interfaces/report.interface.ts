import { ReportStatus } from '../enums/report-status.enum';
import { IVersionedUserEntityBase } from '../../common/interfaces/versioned-user-entity-base.interface';

export interface IReport extends IVersionedUserEntityBase {
    id: number;
    filename?: string;
    content?: string;
    status: ReportStatus;
}
