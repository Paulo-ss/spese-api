import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IReport } from '../interfaces/report.interface';
import { ReportStatus } from '../enums/report-status.enum';
import { VersionedUserEntityBase } from '../../common/entities/versioned-user-base.entity';

@Entity({ name: 'reports' })
export class Report extends VersionedUserEntityBase implements IReport {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column('text', { name: 'content', nullable: true })
    public content: string;

    @Column({ name: 'filename', nullable: true })
    public filename: string;

    @Column('enum', { name: 'status', enum: ReportStatus })
    public status: ReportStatus;
}
