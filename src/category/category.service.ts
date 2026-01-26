import { Injectable } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { CommonService } from 'src/common/common.service';
import { PersistCategoryDto } from './dto/persist-category.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepository: CategoryRepository,
        private readonly commonService: CommonService,
    ) {}

    public async findById(
        id: number,
        userId: number,
        checkForExistence: boolean = true,
    ): Promise<Category> {
        const category = await this.categoryRepository.findById(id, userId);

        if (checkForExistence) {
            this.commonService.checkEntityExistence(category, 'Categoria');
        }

        return category;
    }

    public async findByUser(userId: number): Promise<Category[]> {
        return await this.categoryRepository.findByUser(userId);
    }

    public async create(
        categoryDto: PersistCategoryDto,
        userId: number,
    ): Promise<Category> {
        return await this.categoryRepository.upsert({
            name: categoryDto.name,
            color: categoryDto.color,
            userId,
        });
    }

    public async createMultiple(
        categoriesDto: PersistCategoryDto[],
        userId: number,
    ): Promise<IGenericMessageResponse> {
        const categories = categoriesDto.map((category) => ({
            name: category.name,
            color: category.color,
            userId,
        }));

        await this.categoryRepository.upsert(categories);

        return this.commonService.generateGenericMessageResponse(
            'Categorias criadas com sucesso.',
        );
    }

    public async update(
        id: number,
        categoryDto: PersistCategoryDto,
        userId: number,
    ): Promise<Category> {
        const category = await this.findById(id, userId);
        category.name = categoryDto.name;
        category.color = categoryDto.color;

        return await this.categoryRepository.upsert(category);
    }

    public async delete(
        id: number,
        userId: number,
    ): Promise<IGenericMessageResponse> {
        const category = await this.findById(id, userId);

        await this.categoryRepository.delete(category);

        return this.commonService.generateGenericMessageResponse(
            'Categoria deletada com sucesso.',
        );
    }
}
