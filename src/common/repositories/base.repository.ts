import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { VersionedEntityBase } from '../entities/versioned-base.entity';
import { EntityTarget, Repository } from 'typeorm';

export class BaseRepository<T extends VersionedEntityBase> {
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
        private readonly targetEntityClass: EntityTarget<T>,
    ) {}

    protected get repository(): Repository<T> {
        return this.txHost.tx.getRepository(this.targetEntityClass);
    }
}
