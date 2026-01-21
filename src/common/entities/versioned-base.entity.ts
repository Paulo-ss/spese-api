import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IVersionedEntityBase } from '../interfaces/versioned-entity-base.interface';

export class VersionedEntityBase implements IVersionedEntityBase {
    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    public createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    public updatedAt: Date;
}
