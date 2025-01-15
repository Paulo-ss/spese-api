import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ICategory } from '../interfaces/category.interface';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';

@Entity({ name: 'categories' })
export class CategoryEntity implements ICategory {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ name: 'name' })
  public name: string;

  @Column({ name: 'color' })
  public color: string;

  @Column({ name: 'user_id' })
  public userId: number;

  @OneToMany(() => ExpenseEntity, (expense) => expense.customCategory)
  public expenses?: ExpenseEntity[];

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
