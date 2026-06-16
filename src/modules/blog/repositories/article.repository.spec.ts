import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Like } from 'typeorm';
import { ArticleEntity } from '../entities/article.entity';
import { ArticleRepository } from './article.repository';
import { ArticleStatus } from '../blog.types';

describe('ArticleRepository', () => {
  let repository: ArticleRepository;
  let typeOrmRepository: any;

  const mockArticle = {
    id: 'article-id',
    title: 'Test Article',
    content: '# Hello World',
    summary: 'A test article',
    authorId: 'test-author-id',
    status: ArticleStatus.PUBLISHED,
    viewCount: 100,
    likeCount: 10,
    isPinned: false,
    coverImage: null,
    categoryId: null,
    publishedAt: new Date('2026-06-15'),
    deletedAt: null,
  } as ArticleEntity;

  beforeEach(async () => {
    typeOrmRepository = {
      findAndCount: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      increment: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleRepository,
        {
          provide: getRepositoryToken(ArticleEntity),
          useValue: typeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<ArticleRepository>(ArticleRepository);
  });

  describe('findPublishedWithPagination', () => {
    it('should return paginated published articles', async () => {
      const expectedItems = [mockArticle];
      const expectedTotal = 1;

      typeOrmRepository.findAndCount.mockResolvedValue([expectedItems, expectedTotal]);

      const result = await repository.findPublishedWithPagination(1, 10);

      expect(result).toEqual({ items: expectedItems, total: expectedTotal });
      expect(typeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where: { status: ArticleStatus.PUBLISHED, deletedAt: IsNull() },
        order: { isPinned: 'DESC', publishedAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.findAndCount.mockRejectedValue(new Error('Database error'));

      await expect(repository.findPublishedWithPagination(1, 10)).rejects.toThrow(DomainError);
      await expect(repository.findPublishedWithPagination(1, 10)).rejects.toHaveProperty(
        'code',
        BLOG_ERROR.QUERY_FAILED,
      );
    });
  });

  describe('findByCategory', () => {
    it('should return articles by category', async () => {
      const categoryId = 'category-1';
      const expectedItems = [mockArticle];
      const expectedTotal = 1;

      typeOrmRepository.findAndCount.mockResolvedValue([expectedItems, expectedTotal]);

      const result = await repository.findByCategory(categoryId, 1, 10);

      expect(result).toEqual({ items: expectedItems, total: expectedTotal });
      expect(typeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where: { categoryId, status: ArticleStatus.PUBLISHED, deletedAt: IsNull() },
        order: { publishedAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.findAndCount.mockRejectedValue(new Error('Database error'));

      await expect(repository.findByCategory('category-1', 1, 10)).rejects.toThrow(DomainError);
    });
  });

  describe('searchByKeyword', () => {
    it('should search articles by keyword in title or content', async () => {
      const keyword = 'test';
      const expectedItems = [mockArticle];
      const expectedTotal = 1;

      typeOrmRepository.findAndCount.mockResolvedValue([expectedItems, expectedTotal]);

      const result = await repository.searchByKeyword(keyword, 1, 10);

      expect(result).toEqual({ items: expectedItems, total: expectedTotal });
      expect(typeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where: [
          { title: Like(`%${keyword}%`), status: ArticleStatus.PUBLISHED, deletedAt: IsNull() },
          { content: Like(`%${keyword}%`), status: ArticleStatus.PUBLISHED, deletedAt: IsNull() },
        ],
        order: { publishedAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should throw DomainError when search fails', async () => {
      typeOrmRepository.findAndCount.mockRejectedValue(new Error('Database error'));

      await expect(repository.searchByKeyword('test', 1, 10)).rejects.toThrow(DomainError);
    });
  });

  describe('findById', () => {
    it('should return article when found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockArticle);

      const result = await repository.findById('article-id');

      expect(result).toEqual(mockArticle);
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'article-id', deletedAt: IsNull() },
      });
    });

    it('should return null when article not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('article-id');

      expect(result).toBeNull();
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(repository.findById('article-id')).rejects.toThrow(DomainError);
    });
  });

  describe('create', () => {
    it('should create and return article', async () => {
      const articleData = { title: 'New Article', content: 'Content', authorId: 'author-id' };
      typeOrmRepository.create.mockReturnValue({ ...articleData });
      typeOrmRepository.save.mockResolvedValue({ ...articleData, id: 'new-id' });

      const result = await repository.create(articleData);

      expect(result).toEqual({ ...articleData, id: 'new-id' });
      expect(typeOrmRepository.create).toHaveBeenCalledWith(articleData);
      expect(typeOrmRepository.save).toHaveBeenCalled();
    });

    it('should throw DomainError when creation fails', async () => {
      typeOrmRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(repository.create({ title: 'New Article' })).rejects.toThrow(DomainError);
      await expect(repository.create({ title: 'New Article' })).rejects.toHaveProperty(
        'code',
        BLOG_ERROR.CREATE_FAILED,
      );
    });
  });

  describe('update', () => {
    it('should update and return article', async () => {
      const updates = { title: 'Updated Title' };
      typeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      typeOrmRepository.findOne.mockResolvedValue({ ...mockArticle, ...updates });

      const result = await repository.update('article-id', updates);

      expect(result).toEqual({ ...mockArticle, ...updates });
      expect(typeOrmRepository.update).toHaveBeenCalledWith('article-id', updates);
    });

    it('should throw DomainError when article not found', async () => {
      typeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      typeOrmRepository.findOne.mockResolvedValue(null);

      await expect(repository.update('article-id', { title: 'Updated' })).rejects.toThrow(
        DomainError,
      );
      await expect(repository.update('article-id', { title: 'Updated' })).rejects.toHaveProperty(
        'code',
        BLOG_ERROR.NOT_FOUND,
      );
    });

    it('should throw DomainError when update fails', async () => {
      typeOrmRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(repository.update('article-id', { title: 'Updated' })).rejects.toThrow(
        DomainError,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete article', async () => {
      typeOrmRepository.softDelete.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await repository.softDelete('article-id');

      expect(typeOrmRepository.softDelete).toHaveBeenCalledWith('article-id');
    });

    it('should throw DomainError when delete fails', async () => {
      typeOrmRepository.softDelete.mockRejectedValue(new Error('Database error'));

      await expect(repository.softDelete('article-id')).rejects.toThrow(DomainError);
      await expect(repository.softDelete('article-id')).rejects.toHaveProperty(
        'code',
        BLOG_ERROR.DELETE_FAILED,
      );
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count', async () => {
      typeOrmRepository.increment.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await repository.incrementViewCount('article-id');

      expect(typeOrmRepository.increment).toHaveBeenCalledWith(
        { id: 'article-id' },
        'viewCount',
        1,
      );
    });

    it('should throw DomainError when increment fails', async () => {
      typeOrmRepository.increment.mockRejectedValue(new Error('Database error'));

      await expect(repository.incrementViewCount('article-id')).rejects.toThrow(DomainError);
    });
  });

  describe('incrementLikeCount', () => {
    it('should increment like count', async () => {
      typeOrmRepository.increment.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await repository.incrementLikeCount('article-id');

      expect(typeOrmRepository.increment).toHaveBeenCalledWith(
        { id: 'article-id' },
        'likeCount',
        1,
      );
    });

    it('should throw DomainError when increment fails', async () => {
      typeOrmRepository.increment.mockRejectedValue(new Error('Database error'));

      await expect(repository.incrementLikeCount('article-id')).rejects.toThrow(DomainError);
    });
  });
});
