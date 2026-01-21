import { Column } from 'typeorm';
import { NumericColumnTransformer } from '../transformers/column-numeric-transformer.transformer';
import { IVersionedUserEntityBase } from '../interfaces/versioned-user-entity-base.interface';
import { VersionedEntityBase } from './versioned-base.entity';

export class VersionedUserEntityBase
    extends VersionedEntityBase
    implements IVersionedUserEntityBase
{
    @Column({ name: 'user_id', transformer: new NumericColumnTransformer() })
    public userId: number;
}
