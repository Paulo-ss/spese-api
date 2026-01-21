import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ICategory } from '../interfaces/category.interface';
import { Expense } from 'src/expenses/entities/expense.entity';
import { VersionedUserEntityBase } from '../../common/entities/versioned-user-base.entity';

@Entity({ name: 'categories' })
export class Category extends VersionedUserEntityBase implements ICategory {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'color' })
    public color: string;

    @OneToMany(() => Expense, (expense) => expense.customCategory)
    public expenses?: Expense[];
}
