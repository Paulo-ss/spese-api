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

  @Column({ name: 'wage' })
  public wage: number;

  @Column({ name: 'user_id' })
  public userId: number;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
