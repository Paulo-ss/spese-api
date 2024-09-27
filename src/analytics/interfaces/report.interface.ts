import { ReportStatus } from '../enums/report-status.enum';

export interface IReport {
  id: number;
  filename?: string;
  content?: string;
  userId: number;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}
