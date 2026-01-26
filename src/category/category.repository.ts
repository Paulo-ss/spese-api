import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { Category } from './entities/category.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DeepPartial } from 'typeorm';

@Injectable()
export class CategoryRepository extends BaseRepository<Category> {
    constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
        super(txHost, Category);
    }

    public async findById(id: number, userId: number): Promise<Category> {
        return await this.repository.findOne({
            where: { id, userId },
        });
    }

    public async findByUser(userId: number): Promise<Category[]> {
        return await this.repository.find({ where: { userId } });
    }

    public async upsert(category: DeepPartial<Category>): Promise<Category>;
    public async upsert(
        categories: DeepPartial<Category>[],
    ): Promise<Category[]>;
    public async upsert(
        categories: DeepPartial<Category> | DeepPartial<Category>[],
    ): Promise<Category | Category[]> {
        return await this.repository.save(
            this.repository.create(categories as unknown),
        );
    }

    public async delete(category: Category): Promise<void> {
        await this.repository.remove(category);
    }
}
