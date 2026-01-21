import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ICashFlowDaily } from '../interfaces/cash-flow.interface';
import { NumericColumnTransformer } from 'src/common/transformers/column-numeric-transformer.transformer';
import { VersionedUserEntityBase } from '../../common/entities/versioned-user-base.entity';

@Entity('cash_flow_by_day')
export class CashFlowByDay
    extends VersionedUserEntityBase
    implements ICashFlowDaily
{
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

    @Column('date', { name: 'date' })
    public date: Date;
}
