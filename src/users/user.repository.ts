import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { User } from './entities/user.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DeepPartial } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<User> {
    constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
        super(txHost, User);
    }

    public async findAll(): Promise<User[]> {
        return await this.repository.find();
    }

    public async findById(userId: number): Promise<User> {
        return await this.repository.findOneBy({ id: userId });
    }

    public async findByEmail(email: string): Promise<User> {
        return await this.repository.findOneBy({ email });
    }

    public async findByUsername(username: string): Promise<User> {
        return await this.repository.findOneBy({ username });
    }

    public async countByUsername(username: string): Promise<number> {
        return await this.repository.countBy({ username: `${username}%` });
    }

    public async countByEmail(email: string): Promise<number> {
        return await this.repository.countBy({ email });
    }

    public async upsert(user: DeepPartial<User>): Promise<User> {
        return await this.repository.save(this.repository.create(user));
    }

    public async delete(user: User): Promise<void> {
        await this.repository.remove(user);
    }
}
