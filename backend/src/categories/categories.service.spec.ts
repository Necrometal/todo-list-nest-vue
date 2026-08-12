import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;
  let categoriesRepository: jest.Mocked<Repository<Category>>;

  const ownerId = 'owner-1';
  const category: Category = {
    id: 'category-1',
    name: 'Work',
    color: '#64748b',
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    categoriesRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<Category>>;

    categoriesService = new CategoriesService(categoriesRepository);
  });

  describe('findOneForUser', () => {
    it('throws NotFoundException when the category does not exist', async () => {
      categoriesRepository.findOneBy.mockResolvedValue(null);

      await expect(
        categoriesService.findOneForUser('missing', ownerId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when the category belongs to someone else', async () => {
      categoriesRepository.findOneBy.mockResolvedValue({
        ...category,
        ownerId: 'someone-else',
      });

      await expect(
        categoriesService.findOneForUser(category.id, ownerId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('saves the category for the owner', async () => {
      categoriesRepository.create.mockReturnValue(category);
      categoriesRepository.save.mockResolvedValue(category);

      const result = await categoriesService.create(ownerId, {
        name: category.name,
      });

      expect(categoriesRepository.create).toHaveBeenCalledWith({
        name: category.name,
        ownerId,
      });
      expect(result).toEqual(category);
    });

    it('rejects a duplicate name for the same owner', async () => {
      categoriesRepository.create.mockReturnValue(category);
      categoriesRepository.save.mockRejectedValue(
        new QueryFailedError('insert', [], new Error('duplicate')),
      );

      await expect(
        categoriesService.create(ownerId, { name: category.name }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('removes the category', async () => {
      categoriesRepository.findOneBy.mockResolvedValue({ ...category });
      categoriesRepository.remove.mockResolvedValue(category);

      await categoriesService.remove(category.id, ownerId);

      expect(categoriesRepository.remove).toHaveBeenCalledWith(category);
    });
  });
});
