import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ICashFlowDaily } from '../interfaces/cash-flow.interface';
import { NumericColumnTransformer } from 'src/common/transformers/column-numeric-transformer.transformer';

@Entity('cash_flow_days')
export class CashFlowDayEntity implements ICashFlowDaily {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column('decimal', {
        name: 'opening_balance',
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: new NumericColumnTransformer(),
    })
    public openingBalance: number;

    @Column('decimal', {
        name: 'closing_balance',
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: new NumericColumnTransformer(),
    })
    public closingBalance: number;

    @Column('timestamp', { name: 'date' })
    public date: Date;

    @Column({ name: 'user_id', transformer: new NumericColumnTransformer() })
    public userId: number;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    public createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    public updatedAt: Date;
}
