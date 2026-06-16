import { DomainError } from '@core/common/errors/domain-error';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';
import { CategoryRepository } from './category.repository';

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  let typeOrmRepository: any;

  const mockCategory = {
    id: 'category-id',
    name: 'Technology',
    slug: 'technology',
    description: 'Tech articles',
    sort: 0,
    parentId: null,
  } as CategoryEntity;

  beforeEach(async () => {
    typeOrmRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryRepository,
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: typeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<CategoryRepository>(CategoryRepository);
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      typeOrmRepository.find.mockResolvedValue([mockCategory]);

      const result = await repository.findAll();

      expect(result).toEqual([mockCategory]);
      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { sort: 'ASC', createdAt: 'ASC' },
      });
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(repository.findAll()).rejects.toThrow(DomainError);
    });
  });

  describe('findRootCategories', () => {
    it('should return root categories', async () => {
      typeOrmRepository.find.mockResolvedValue([mockCategory]);

      const result = await repository.findRootCategories();

      expect(result).toEqual([mockCategory]);
      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { parentId: IsNull() },
        order: { sort: 'ASC', createdAt: 'ASC' },
      });
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(repository.findRootCategories()).rejects.toThrow(DomainError);
    });
  });

  describe('findById', () => {
    it('should return category when found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockCategory);

      const result = await repository.findById('category-id');

      expect(result).toEqual(mockCategory);
    });

    it('should return null when category not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('category-id');

      expect(result).toBeNull();
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(repository.findById('category-id')).rejects.toThrow(DomainError);
    });
  });

  describe('findBySlug', () => {
    it('should return category by slug', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockCategory);

      const result = await repository.findBySlug('technology');

      expect(result).toEqual(mockCategory);
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({ where: { slug: 'technology' } });
    });

    it('should return null when slug not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findBySlug('unknown');

      expect(result).toBeNull();
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(repository.findBySlug('technology')).rejects.toThrow(DomainError);
    });
  });

  describe('create', () => {
    it('should create and return category', async () => {
      const categoryData = { name: 'New Category', slug: 'new-category' };
      typeOrmRepository.create.mockReturnValue({ ...categoryData });
      typeOrmRepository.save.mockResolvedValue({ ...categoryData, id: 'new-id' });

      const result = await repository.create(categoryData);

      expect(result).toEqual({ ...categoryData, id: 'new-id' });
    });

    it('should throw DomainError when creation fails', async () => {
      typeOrmRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(repository.create({ name: 'New Category' })).rejects.toThrow(DomainError);
    });
  });

  describe('update', () => {
    it('should update and return category', async () => {
      const updates = { name: 'Updated Name' };
      typeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      typeOrmRepository.findOne.mockResolvedValue({ ...mockCategory, ...updates });

      const result = await repository.update('category-id', updates);

      expect(result).toEqual({ ...mockCategory, ...updates });
    });

    it('should throw DomainError when category not found', async () => {
      typeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      typeOrmRepository.findOne.mockResolvedValue(null);

      await expect(repository.update('category-id', { name: 'Updated' })).rejects.toThrow(
        DomainError,
      );
    });

    it('should throw DomainError when update fails', async () => {
      typeOrmRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(repository.update('category-id', { name: 'Updated' })).rejects.toThrow(
        DomainError,
      );
    });
  });

  describe('delete', () => {
    it('should delete category', async () => {
      typeOrmRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await repository.delete('category-id');

      expect(typeOrmRepository.delete).toHaveBeenCalledWith('category-id');
    });

    it('should throw DomainError when delete fails', async () => {
      typeOrmRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(repository.delete('category-id')).rejects.toThrow(DomainError);
    });
  });
});
