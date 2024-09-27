import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IReport } from '../interfaces/report.interface';
import { ReportStatus } from '../enums/report-status.enum';

@Entity({ name: 'reports' })
export class ReportEntity implements IReport {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('text', { name: 'content', nullable: true })
  public content: string;

  @Column({ name: 'filename', nullable: true })
  public filename: string;

  @Column({ name: 'user_id' })
  public userId: number;

  @Column('enum', { name: 'status', enum: ReportStatus })
  public status: ReportStatus;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
