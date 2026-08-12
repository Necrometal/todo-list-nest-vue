import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAllForUser(ownerId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { ownerId },
      order: { name: 'ASC' },
    });
  }

  async findOneForUser(id: string, ownerId: string): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.ownerId !== ownerId) {
      throw new ForbiddenException('Not your category');
    }
    return category;
  }

  async create(ownerId: string, dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({ ...dto, ownerId });
    try {
      return await this.categoriesRepository.save(category);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException('Category name already in use');
      }
      throw error;
    }
  }

  async update(
    id: string,
    ownerId: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOneForUser(id, ownerId);
    Object.assign(category, dto);
    try {
      return await this.categoriesRepository.save(category);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException('Category name already in use');
      }
      throw error;
    }
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const category = await this.findOneForUser(id, ownerId);
    await this.categoriesRepository.remove(category);
  }
}
