import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { PersistCategoryDto } from './dto/persist-category.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly commonService: CommonService,
  ) {}

  public async findById(
    id: number,
    userId: number,
    checkForExistence: boolean = true,
  ): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
    });

    if (checkForExistence) {
      this.commonService.checkEntityExistence(category, 'Categoria');
    }

    return category;
  }

  public async findByUser(userId: number): Promise<CategoryEntity[]> {
    return await this.categoryRepository.find({ where: { userId } });
  }

  public async create(
    categoryDto: PersistCategoryDto,
    userId: number,
  ): Promise<CategoryEntity> {
    const category = this.categoryRepository.create({
      name: categoryDto.name,
      color: categoryDto.color,
      userId,
    });
    await this.commonService.saveEntity(this.categoryRepository, category);

    return category;
  }

  public async createMultiple(
    categoriesDto: PersistCategoryDto[],
    userId: number,
  ): Promise<IGenericMessageResponse> {
    const categories: CategoryEntity[] = [];

    for (const category of categoriesDto) {
      categories.push(
        this.categoryRepository.create({
          name: category.name,
          color: category.color,
          userId,
        }),
      );
    }

    await this.commonService.saveMultipleEntities(
      this.categoryRepository,
      categories,
    );

    return this.commonService.generateGenericMessageResponse(
      'Categorias criadas com sucesso.',
    );
  }

  public async update(
    id: number,
    categoryDto: PersistCategoryDto,
    userId: number,
  ): Promise<CategoryEntity> {
    const category = await this.findById(id, userId);
    category.name = categoryDto.name;
    category.color = categoryDto.color;

    await this.commonService.saveEntity(this.categoryRepository, category);

    return category;
  }

  public async delete(
    id: number,
    userId: number,
  ): Promise<IGenericMessageResponse> {
    const category = await this.findById(id, userId);

    await this.commonService.removeEntity(this.categoryRepository, category);

    return this.commonService.generateGenericMessageResponse(
      'Categoria deletada com sucesso.',
    );
  }
}
