import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';
import { PersistCategoryDto } from './dto/persist-category.dto';

@UseGuards(IsAuthenticatedGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get(':id')
  public async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.categoryService.findById(id, userId);
  }

  @Get('all/user')
  public async getByUserId(@CurrentUser() userId: number) {
    return this.categoryService.findByUser(userId);
  }

  @Post()
  public async create(
    @Body() category: PersistCategoryDto,
    @CurrentUser() userId: number,
  ) {
    return this.categoryService.create(category, userId);
  }

  @Put(':id')
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() category: PersistCategoryDto,
    @CurrentUser() userId: number,
  ) {
    return this.categoryService.update(id, category, userId);
  }

  @Delete(':id')
  public async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.categoryService.delete(id, userId);
  }
}
