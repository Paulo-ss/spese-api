import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DeepPartial } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BlacklistedTokenRepository extends BaseRepository<BlacklistedToken> {
    constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
        super(txHost, BlacklistedToken);
    }

    public async countByUserAndTokenId(
        user: User,
        tokenId: string,
    ): Promise<number> {
        return await this.repository.countBy({ user, tokenId });
    }

    public async upsert(
        token: DeepPartial<BlacklistedToken>,
    ): Promise<BlacklistedToken> {
        return await this.repository.save(this.repository.create(token));
    }
}
