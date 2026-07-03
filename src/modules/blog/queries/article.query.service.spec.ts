import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Test, TestingModule } from '@nestjs/testing';
import { ArticleEntity } from '../entities/article.entity';
import { ArticleRepository } from '../repositories/article.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { ArticleQueryService } from './article.query.service';
import { ArticleStatus, ArticleFilterInput, PaginationInput } from '../blog.types';

describe('ArticleQueryService', () => {
  let service: ArticleQueryService;
  let articleRepository: any;
  let categoryRepository: any;

  const mockArticleEntity = {
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
    createdAt: new Date('2026-06-14'),
    updatedAt: new Date('2026-06-15'),
  } as ArticleEntity;

  beforeEach(async () => {
    articleRepository = {
      findPublishedWithPagination: jest.fn(),
      findByCategory: jest.fn(),
      findByTags: jest.fn(),
      searchByKeyword: jest.fn(),
      findPinnedArticles: jest.fn(),
      incrementViewCount: jest.fn(),
      incrementLikeCount: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      getArchives: jest.fn(),
      getCategoryStats: jest.fn(),
    };

    categoryRepository = {
      findAll: jest.fn(),
      findRootCategories: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleQueryService,
        { provide: ArticleRepository, useValue: articleRepository },
        { provide: CategoryRepository, useValue: categoryRepository },
      ],
    }).compile();

    service = module.get<ArticleQueryService>(ArticleQueryService);
  });

  describe('getArticles', () => {
    const pagination: PaginationInput = { page: 1, limit: 10 };

    it('should return published articles without filter', async () => {
      articleRepository.findPublishedWithPagination.mockResolvedValue({
        items: [mockArticleEntity],
        total: 1,
      });

      const result = await service.getArticles({}, pagination);

      expect(result).toEqual({
        items: [
          {
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
            createdAt: new Date('2026-06-14'),
            updatedAt: new Date('2026-06-15'),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        pageInfo: {
          hasNext: false,
        },
      });
      expect(articleRepository.findPublishedWithPagination).toHaveBeenCalledWith(1, 10);
    });

    it('should return articles filtered by category', async () => {
      const filter: ArticleFilterInput = { categoryId: 'category-1' };
      articleRepository.findByCategory.mockResolvedValue({
        items: [mockArticleEntity],
        total: 1,
      });

      const result = await service.getArticles(filter, pagination);

      expect(result.items).toHaveLength(1);
      expect(articleRepository.findByCategory).toHaveBeenCalledWith('category-1', 1, 10);
    });

    it('should return articles filtered by tags', async () => {
      const filter: ArticleFilterInput = { tagIds: ['tag-1', 'tag-2'] };
      articleRepository.findByTags.mockResolvedValue({
        items: [mockArticleEntity],
        total: 1,
      });

      const result = await service.getArticles(filter, pagination);

      expect(result.items).toHaveLength(1);
      expect(articleRepository.findByTags).toHaveBeenCalledWith(['tag-1', 'tag-2'], 1, 10);
    });

    it('should return articles searched by keyword', async () => {
      const filter: ArticleFilterInput = { keyword: 'test' };
      articleRepository.searchByKeyword.mockResolvedValue({
        items: [mockArticleEntity],
        total: 1,
      });

      const result = await service.getArticles(filter, pagination);

      expect(result.items).toHaveLength(1);
      expect(articleRepository.searchByKeyword).toHaveBeenCalledWith('test', 1, 10);
    });

    it('should throw DomainError when repository throws', async () => {
      articleRepository.findPublishedWithPagination.mockRejectedValue(
        new DomainError(BLOG_ERROR.QUERY_FAILED, 'Query failed'),
      );

      await expect(service.getArticles({}, pagination)).rejects.toThrow(DomainError);
    });

    it('should throw DomainError when unknown error occurs', async () => {
      articleRepository.findPublishedWithPagination.mockRejectedValue(new Error('Unknown error'));

      await expect(service.getArticles({}, pagination)).rejects.toThrow(DomainError);
    });
  });

  describe('getArticleById', () => {
    it('should return article view when found', async () => {
      articleRepository.findById.mockResolvedValue(mockArticleEntity);

      const result = await service.getArticleById('article-id');

      expect(result).toEqual({
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
        createdAt: new Date('2026-06-14'),
        updatedAt: new Date('2026-06-15'),
      });
    });

    it('should return null when article not found', async () => {
      articleRepository.findById.mockResolvedValue(null);

      const result = await service.getArticleById('article-id');

      expect(result).toBeNull();
    });

    it('should throw DomainError when repository throws', async () => {
      articleRepository.findById.mockRejectedValue(
        new DomainError(BLOG_ERROR.QUERY_FAILED, 'Query failed'),
      );

      await expect(service.getArticleById('article-id')).rejects.toThrow(DomainError);
    });
  });

  describe('getArchives', () => {
    it('should return archives', async () => {
      const mockArchives = [
        { year: 2026, month: 6, count: 5 },
        { year: 2026, month: 5, count: 3 },
      ];
      articleRepository.getArchives.mockResolvedValue(mockArchives);

      const result = await service.getArchives();

      expect(result).toEqual(mockArchives);
      expect(articleRepository.getArchives).toHaveBeenCalled();
    });

    it('should throw DomainError when repository throws', async () => {
      articleRepository.getArchives.mockRejectedValue(
        new DomainError(BLOG_ERROR.QUERY_FAILED, 'Query failed'),
      );

      await expect(service.getArchives()).rejects.toThrow(DomainError);
    });
  });

  describe('getCategoryStats', () => {
    it('should return category stats', async () => {
      const mockStats = [
        { categoryId: 'cat-1', categoryName: 'Category 1', articleCount: 10 },
        { categoryId: 'cat-2', categoryName: 'Category 2', articleCount: 5 },
      ];
      articleRepository.getCategoryStats.mockResolvedValue(mockStats);

      const result = await service.getCategoryStats();

      expect(result).toEqual(mockStats);
      expect(articleRepository.getCategoryStats).toHaveBeenCalled();
    });

    it('should throw DomainError when repository throws', async () => {
      articleRepository.getCategoryStats.mockRejectedValue(
        new DomainError(BLOG_ERROR.QUERY_FAILED, 'Query failed'),
      );

      await expect(service.getCategoryStats()).rejects.toThrow(DomainError);
    });
  });
});
