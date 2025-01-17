import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IWage } from '../interfaces/wage.interface';

@Entity({ name: 'wages' })
export class WageEntity implements IWage {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('decimal', { name: 'wage', precision: 10, scale: 2 })
  public wage: number;

  @Column({ name: 'paymment_day' })
  public paymmentDay: number;

  @Column({ name: 'user_id' })
  public userId: number;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
