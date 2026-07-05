import { DomainError } from '@core/common/errors/domain-error';
import { Test, TestingModule } from '@nestjs/testing';
import { ArticleRepository } from '@src/modules/blog/repositories/article.repository';
import { CategoryRepository } from '@src/modules/blog/repositories/category.repository';
import { TagRepository } from '@src/modules/blog/repositories/tag.repository';
import { CommentRepository } from '@src/modules/blog/repositories/comment.repository';
import { ArticleQueryService } from '@src/modules/blog/queries/article.query.service';
import { CommentQueryService } from '@src/modules/blog/queries/comment.query.service';
import { TRANSACTION_RUNNER } from '@src/usecases/common/ports/transaction-runner.contract';
import { CreateArticleUsecase } from './create-article.usecase';
import { UpdateArticleUsecase } from './update-article.usecase';
import { DeleteArticleUsecase } from './delete-article.usecase';
import { CreateCategoryUsecase } from './create-category.usecase';
import { UpdateCategoryUsecase } from './update-category.usecase';
import { DeleteCategoryUsecase } from './delete-category.usecase';
import { CreateTagUsecase } from './create-tag.usecase';
import { UpdateTagUsecase } from './update-tag.usecase';
import { DeleteTagUsecase } from './delete-tag.usecase';
import { CreateCommentUsecase } from './create-comment.usecase';
import { UpdateCommentStatusUsecase } from './update-comment-status.usecase';
import { DeleteCommentUsecase } from './delete-comment.usecase';
import { ApproveCommentUsecase } from './approve-comment.usecase';
import { RejectCommentUsecase } from './reject-comment.usecase';
import { ArticleStatus, CommentStatus } from '@src/modules/blog/blog.types';

describe('Blog Usecases', () => {
  const mockTransactionRunner = {
    run: jest.fn((callback) => callback({})),
  };

  const adminSession = { accountId: 1, roles: ['ADMIN'] };
  const userSession = { accountId: 3, roles: ['REGISTRANT'] };
  const emptySession = { accountId: 4, roles: [] };

  const createMockArticleEntity = (
    overrides: Partial<{ id: string; authorId: string; publishedAt: Date | null }> = {},
  ) => ({
    id: overrides.id || 'article-1',
    title: 'Test Article',
    content: 'Test Content',
    coverImage: null,
    summary: 'Test Summary',
    status: ArticleStatus.DRAFT,
    categoryId: null,
    authorId: overrides.authorId || '3',
    viewCount: 0,
    likeCount: 0,
    isPinned: false,
    publishedAt: overrides.publishedAt ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const createMockCategoryEntity = (
    overrides: Partial<{ id: string; name: string; slug: string }> = {},
  ) => ({
    id: overrides.id || 'cat-1',
    name: overrides.name || 'Test',
    slug: overrides.slug || 'test',
    description: null,
    parentId: null,
    sort: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('CreateArticleUsecase', () => {
    let usecase: CreateArticleUsecase;
    let articleRepository: jest.Mocked<ArticleRepository>;
    let articleQueryService: jest.Mocked<ArticleQueryService>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CreateArticleUsecase,
          { provide: ArticleRepository, useValue: { create: jest.fn() } },
          { provide: ArticleQueryService, useValue: { getArticleById: jest.fn() } },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<CreateArticleUsecase>(CreateArticleUsecase);
      articleRepository = module.get(ArticleRepository);
      articleQueryService = module.get(ArticleQueryService);
    });

    it('should create article successfully', async () => {
      const articleId = 'article-1';
      articleRepository.create.mockResolvedValue(createMockArticleEntity({ id: articleId }));
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: articleId,
        title: 'Test',
        content: 'Content',
        coverImage: null,
        summary: 'Summary',
        status: ArticleStatus.DRAFT,
        categoryId: null,
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        input: { title: 'Test', content: 'Content', summary: 'Summary' },
        authorId: '3',
        session: userSession,
      });

      expect(result.id).toBe(articleId);
      expect(result.title).toBe('Test');
      expect(articleRepository.create).toHaveBeenCalled();
    });

    it('should throw error when article not found after creation', async () => {
      articleRepository.create.mockResolvedValue(createMockArticleEntity());
      articleQueryService.getArticleById.mockResolvedValue(null);

      await expect(
        usecase.execute({
          input: { title: 'Test', content: 'Content', summary: 'Summary' },
          authorId: '3',
          session: userSession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should throw error when user has no permission', async () => {
      await expect(
        usecase.execute({
          input: { title: 'Test', content: 'Content', summary: 'Summary' },
          authorId: '123',
          session: emptySession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should create article with coverImage', async () => {
      const articleId = 'article-1';
      articleRepository.create.mockResolvedValue({
        ...createMockArticleEntity({ id: articleId }),
        coverImage: 'https://example.com/cover.jpg',
      });
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: articleId,
        title: 'Test',
        content: 'Content',
        coverImage: 'https://example.com/cover.jpg',
        summary: 'Summary',
        status: ArticleStatus.DRAFT,
        categoryId: null,
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        input: {
          title: 'Test',
          content: 'Content',
          summary: 'Summary',
          coverImage: 'https://example.com/cover.jpg',
        },
        authorId: '3',
        session: userSession,
      });

      expect(result.id).toBe(articleId);
      expect(result.coverImage).toBe('https://example.com/cover.jpg');
    });

    it('should create article with categoryId', async () => {
      const articleId = 'article-1';
      articleRepository.create.mockResolvedValue({
        ...createMockArticleEntity({ id: articleId }),
        categoryId: 'cat-1',
      });
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: articleId,
        title: 'Test',
        content: 'Content',
        coverImage: null,
        summary: 'Summary',
        status: ArticleStatus.DRAFT,
        categoryId: 'cat-1',
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        input: { title: 'Test', content: 'Content', summary: 'Summary', categoryId: 'cat-1' },
        authorId: '3',
        session: userSession,
      });

      expect(result.id).toBe(articleId);
      expect(result.categoryId).toBe('cat-1');
    });

    it('should create article with isPinned true', async () => {
      const articleId = 'article-1';
      articleRepository.create.mockResolvedValue({
        ...createMockArticleEntity({ id: articleId }),
        isPinned: true,
      });
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: articleId,
        title: 'Test',
        content: 'Content',
        coverImage: null,
        summary: 'Summary',
        status: ArticleStatus.DRAFT,
        categoryId: null,
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: true,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        input: { title: 'Test', content: 'Content', summary: 'Summary', isPinned: true },
        authorId: '3',
        session: userSession,
      });

      expect(result.id).toBe(articleId);
      expect(result.isPinned).toBe(true);
    });

    it('should normalize empty coverImage to null', async () => {
      const articleId = 'article-1';
      articleRepository.create.mockResolvedValue(createMockArticleEntity({ id: articleId }));
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: articleId,
        title: 'Test',
        content: 'Content',
        coverImage: null,
        summary: 'Summary',
        status: ArticleStatus.DRAFT,
        categoryId: null,
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await usecase.execute({
        input: { title: 'Test', content: 'Content', summary: 'Summary', coverImage: '' },
        authorId: '3',
        session: userSession,
      });

      expect(articleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ coverImage: null }),
        expect.anything(),
      );
    });

    it('should create article within existing transaction', async () => {
      const articleId = 'article-1';
      const mockTransactionContext = {} as any;
      articleRepository.create.mockResolvedValue(createMockArticleEntity({ id: articleId }));
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: articleId,
        title: 'Test',
        content: 'Content',
        coverImage: null,
        summary: 'Summary',
        status: ArticleStatus.DRAFT,
        categoryId: null,
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        input: { title: 'Test', content: 'Content', summary: 'Summary' },
        authorId: '3',
        session: userSession,
        transactionContext: mockTransactionContext,
      });

      expect(result.id).toBe(articleId);
      expect(mockTransactionRunner.run).not.toHaveBeenCalled();
    });
  });

  describe('UpdateArticleUsecase', () => {
    let usecase: UpdateArticleUsecase;
    let articleRepository: jest.Mocked<ArticleRepository>;
    let articleQueryService: jest.Mocked<ArticleQueryService>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UpdateArticleUsecase,
          { provide: ArticleRepository, useValue: { findById: jest.fn(), update: jest.fn() } },
          { provide: ArticleQueryService, useValue: { getArticleById: jest.fn() } },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<UpdateArticleUsecase>(UpdateArticleUsecase);
      articleRepository = module.get(ArticleRepository);
      articleQueryService = module.get(ArticleQueryService);
    });

    it('should update article successfully', async () => {
      articleRepository.findById.mockResolvedValue(createMockArticleEntity());
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: 'article-1',
        title: 'Updated',
        content: 'Test Content',
        coverImage: null,
        summary: 'Test Summary',
        status: ArticleStatus.DRAFT,
        categoryId: null,
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        id: 'article-1',
        input: { title: 'Updated' },
        session: userSession,
      });

      expect(result.title).toBe('Updated');
      expect(result.id).toBe('article-1');
      expect(articleRepository.update).toHaveBeenCalled();
    });

    it('should set publishedAt when status changes to PUBLISHED', async () => {
      articleRepository.findById.mockResolvedValue(createMockArticleEntity({ publishedAt: null }));
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: 'article-1',
        title: 'Test Article',
        content: 'Test Content',
        coverImage: null,
        summary: 'Test Summary',
        status: ArticleStatus.PUBLISHED,
        categoryId: null,
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      await usecase.execute({
        id: 'article-1',
        input: { status: ArticleStatus.PUBLISHED },
        session: userSession,
      });

      expect(articleRepository.update).toHaveBeenCalled();
    });

    it('should throw error when article not found', async () => {
      articleRepository.findById.mockResolvedValue(null);

      await expect(
        usecase.execute({
          id: 'article-1',
          input: { title: 'Updated' },
          session: userSession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should throw error when user has no permission', async () => {
      articleRepository.findById.mockResolvedValue(createMockArticleEntity({ authorId: '999' }));

      await expect(
        usecase.execute({
          id: 'article-1',
          input: { title: 'Updated' },
          session: userSession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should NOT set publishedAt when status changes from PUBLISHED to ARCHIVED', async () => {
      const now = new Date('2026-06-01');
      articleRepository.findById.mockResolvedValue({
        ...createMockArticleEntity({ publishedAt: now }),
        status: ArticleStatus.PUBLISHED,
      });
      const updatedNow = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: 'article-1',
        title: 'Test Article',
        content: 'Test Content',
        coverImage: null,
        summary: 'Test Summary',
        status: ArticleStatus.ARCHIVED,
        categoryId: null,
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: now,
        createdAt: updatedNow,
        updatedAt: updatedNow,
      });

      const result = await usecase.execute({
        id: 'article-1',
        input: { status: ArticleStatus.ARCHIVED },
        session: userSession,
      });

      expect(result.status).toBe(ArticleStatus.ARCHIVED);
      expect(result.publishedAt).toEqual(now);
    });

    it('should NOT set publishedAt when article is already published', async () => {
      const originalPublishedAt = new Date('2026-06-01');
      articleRepository.findById.mockResolvedValue({
        ...createMockArticleEntity({ publishedAt: originalPublishedAt }),
        status: ArticleStatus.PUBLISHED,
      });
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: 'article-1',
        title: 'Test Article',
        content: 'Test Content',
        coverImage: null,
        summary: 'Test Summary',
        status: ArticleStatus.PUBLISHED,
        categoryId: null,
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: originalPublishedAt,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        id: 'article-1',
        input: { status: ArticleStatus.PUBLISHED },
        session: userSession,
      });

      expect(result.publishedAt).toEqual(originalPublishedAt);
    });

    it('should update coverImage', async () => {
      articleRepository.findById.mockResolvedValue(createMockArticleEntity());
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: 'article-1',
        title: 'Test Article',
        content: 'Test Content',
        coverImage: 'https://example.com/new-cover.jpg',
        summary: 'Test Summary',
        status: ArticleStatus.DRAFT,
        categoryId: null,
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        id: 'article-1',
        input: { coverImage: 'https://example.com/new-cover.jpg' },
        session: userSession,
      });

      expect(result.coverImage).toBe('https://example.com/new-cover.jpg');
    });

    it('should update categoryId', async () => {
      articleRepository.findById.mockResolvedValue(createMockArticleEntity());
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: 'article-1',
        title: 'Test Article',
        content: 'Test Content',
        coverImage: null,
        summary: 'Test Summary',
        status: ArticleStatus.DRAFT,
        categoryId: 'cat-2',
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        id: 'article-1',
        input: { categoryId: 'cat-2' },
        session: userSession,
      });

      expect(result.categoryId).toBe('cat-2');
    });

    it('should update isPinned', async () => {
      articleRepository.findById.mockResolvedValue(createMockArticleEntity());
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: 'article-1',
        title: 'Test Article',
        content: 'Test Content',
        coverImage: null,
        summary: 'Test Summary',
        status: ArticleStatus.DRAFT,
        categoryId: null,
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: true,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        id: 'article-1',
        input: { isPinned: true },
        session: userSession,
      });

      expect(result.isPinned).toBe(true);
    });

    it('should update article within existing transaction', async () => {
      const mockTransactionContext = {} as any;
      articleRepository.findById.mockResolvedValue(createMockArticleEntity());
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: 'article-1',
        title: 'Updated',
        content: 'Test Content',
        coverImage: null,
        summary: 'Test Summary',
        status: ArticleStatus.DRAFT,
        categoryId: null,
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        id: 'article-1',
        input: { title: 'Updated' },
        session: userSession,
        transactionContext: mockTransactionContext,
      });

      expect(result.title).toBe('Updated');
      expect(mockTransactionRunner.run).not.toHaveBeenCalled();
    });

    it('should handle empty input', async () => {
      articleRepository.findById.mockResolvedValue(createMockArticleEntity());
      const now = new Date();
      articleQueryService.getArticleById.mockResolvedValue({
        id: 'article-1',
        title: 'Test Article',
        content: 'Test Content',
        coverImage: null,
        summary: 'Test Summary',
        status: ArticleStatus.DRAFT,
        categoryId: null,
        authorId: '3',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        id: 'article-1',
        input: {},
        session: userSession,
      });

      expect(result.id).toBe('article-1');
    });
  });

  describe('DeleteArticleUsecase', () => {
    let usecase: DeleteArticleUsecase;
    let articleRepository: jest.Mocked<ArticleRepository>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteArticleUsecase,
          { provide: ArticleRepository, useValue: { findById: jest.fn(), softDelete: jest.fn() } },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<DeleteArticleUsecase>(DeleteArticleUsecase);
      articleRepository = module.get(ArticleRepository);
    });

    it('should delete article successfully', async () => {
      articleRepository.findById.mockResolvedValue(createMockArticleEntity());

      await usecase.execute({ id: 'article-1', session: userSession });

      expect(articleRepository.softDelete).toHaveBeenCalled();
    });

    it('should throw error when article not found', async () => {
      articleRepository.findById.mockResolvedValue(null);

      await expect(usecase.execute({ id: 'article-1', session: userSession })).rejects.toThrow(
        DomainError,
      );
    });

    it('should throw error when user has no permission', async () => {
      articleRepository.findById.mockResolvedValue(createMockArticleEntity({ authorId: '999' }));

      await expect(usecase.execute({ id: 'article-1', session: userSession })).rejects.toThrow(
        DomainError,
      );
    });
  });

  describe('CreateCategoryUsecase', () => {
    let usecase: CreateCategoryUsecase;
    let categoryRepository: jest.Mocked<CategoryRepository>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CreateCategoryUsecase,
          { provide: CategoryRepository, useValue: { create: jest.fn(), findBySlug: jest.fn() } },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<CreateCategoryUsecase>(CreateCategoryUsecase);
      categoryRepository = module.get(CategoryRepository);
    });

    it('should create category successfully', async () => {
      categoryRepository.findBySlug.mockResolvedValue(null);
      categoryRepository.create.mockResolvedValue(createMockCategoryEntity());

      const result = await usecase.execute({
        input: { name: 'Test', slug: 'test' },
        session: adminSession,
      });

      expect(result).toEqual({
        id: 'cat-1',
        name: 'Test',
        slug: 'test',
        description: null,
        parentId: null,
        sort: 0,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw error when slug already exists', async () => {
      categoryRepository.findBySlug.mockResolvedValue({
        id: 'cat-1',
        name: 'Test',
        slug: 'test',
        description: null,
        parentId: null,
        sort: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        usecase.execute({
          input: { name: 'Test', slug: 'test' },
          session: adminSession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should throw error when user has no permission', async () => {
      await expect(
        usecase.execute({
          input: { name: 'Test', slug: 'test' },
          session: userSession,
        }),
      ).rejects.toThrow(DomainError);
    });
  });

  describe('UpdateCategoryUsecase', () => {
    let usecase: UpdateCategoryUsecase;
    let categoryRepository: jest.Mocked<CategoryRepository>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UpdateCategoryUsecase,
          {
            provide: CategoryRepository,
            useValue: { findById: jest.fn(), update: jest.fn(), findBySlug: jest.fn() },
          },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<UpdateCategoryUsecase>(UpdateCategoryUsecase);
      categoryRepository = module.get(CategoryRepository);
    });

    it('should update category successfully', async () => {
      categoryRepository.findById.mockResolvedValue({
        id: 'cat-1',
        name: 'Old',
        slug: 'old',
        description: null,
        parentId: null,
        sort: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      categoryRepository.findBySlug.mockResolvedValue(null);
      categoryRepository.update.mockResolvedValue({
        id: 'cat-1',
        name: 'Updated',
        slug: 'updated',
        description: null,
        parentId: null,
        sort: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await usecase.execute({
        id: 'cat-1',
        input: { name: 'Updated', slug: 'updated' },
        session: adminSession,
      });

      expect(result).toEqual({
        id: 'cat-1',
        name: 'Updated',
        slug: 'updated',
        description: null,
        parentId: null,
        sort: 0,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw error when category not found', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(
        usecase.execute({
          id: 'cat-1',
          input: { name: 'Updated' },
          session: adminSession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should throw error when slug already exists', async () => {
      categoryRepository.findById.mockResolvedValue({
        id: 'cat-1',
        name: 'Old',
        slug: 'old',
        description: null,
        parentId: null,
        sort: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      categoryRepository.findBySlug.mockResolvedValue({
        id: 'cat-2',
        name: 'Other',
        slug: 'updated',
        description: null,
        parentId: null,
        sort: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        usecase.execute({
          id: 'cat-1',
          input: { slug: 'updated' },
          session: adminSession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should throw error when user has no permission', async () => {
      await expect(
        usecase.execute({
          id: 'cat-1',
          input: { name: 'Updated' },
          session: userSession,
        }),
      ).rejects.toThrow(DomainError);
    });
  });

  describe('DeleteCategoryUsecase', () => {
    let usecase: DeleteCategoryUsecase;
    let categoryRepository: jest.Mocked<CategoryRepository>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteCategoryUsecase,
          { provide: CategoryRepository, useValue: { findById: jest.fn(), delete: jest.fn() } },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<DeleteCategoryUsecase>(DeleteCategoryUsecase);
      categoryRepository = module.get(CategoryRepository);
    });

    it('should delete category successfully', async () => {
      categoryRepository.findById.mockResolvedValue({
        id: 'cat-1',
        name: 'Test',
        slug: 'test',
        description: null,
        parentId: null,
        sort: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await usecase.execute({ id: 'cat-1', session: adminSession });

      expect(categoryRepository.delete).toHaveBeenCalled();
    });

    it('should throw error when category not found', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(usecase.execute({ id: 'cat-1', session: adminSession })).rejects.toThrow(
        DomainError,
      );
    });

    it('should throw error when user has no permission', async () => {
      await expect(usecase.execute({ id: 'cat-1', session: userSession })).rejects.toThrow(
        DomainError,
      );
    });
  });

  describe('CreateTagUsecase', () => {
    let usecase: CreateTagUsecase;
    let tagRepository: jest.Mocked<TagRepository>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CreateTagUsecase,
          {
            provide: TagRepository,
            useValue: { create: jest.fn(), findByName: jest.fn(), findBySlug: jest.fn() },
          },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<CreateTagUsecase>(CreateTagUsecase);
      tagRepository = module.get(TagRepository);
    });

    it('should create tag successfully', async () => {
      tagRepository.findByName.mockResolvedValue(null);
      tagRepository.findBySlug.mockResolvedValue(null);
      tagRepository.create.mockResolvedValue({
        id: 'tag-1',
        name: 'Test',
        slug: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await usecase.execute({
        input: { name: 'Test', slug: 'test' },
        session: adminSession,
      });

      expect(result).toEqual({
        id: 'tag-1',
        name: 'Test',
        slug: 'test',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw error when name already exists', async () => {
      tagRepository.findByName.mockResolvedValue({
        id: 'tag-1',
        name: 'Test',
        slug: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        usecase.execute({
          input: { name: 'Test', slug: 'test' },
          session: adminSession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should throw error when slug already exists', async () => {
      tagRepository.findByName.mockResolvedValue(null);
      tagRepository.findBySlug.mockResolvedValue({
        id: 'tag-1',
        name: 'Other',
        slug: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        usecase.execute({
          input: { name: 'Test', slug: 'test' },
          session: adminSession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should throw error when user has no permission', async () => {
      await expect(
        usecase.execute({
          input: { name: 'Test', slug: 'test' },
          session: userSession,
        }),
      ).rejects.toThrow(DomainError);
    });
  });

  describe('UpdateTagUsecase', () => {
    let usecase: UpdateTagUsecase;
    let tagRepository: jest.Mocked<TagRepository>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UpdateTagUsecase,
          {
            provide: TagRepository,
            useValue: {
              findById: jest.fn(),
              update: jest.fn(),
              findByName: jest.fn(),
              findBySlug: jest.fn(),
            },
          },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<UpdateTagUsecase>(UpdateTagUsecase);
      tagRepository = module.get(TagRepository);
    });

    it('should update tag successfully', async () => {
      tagRepository.findById.mockResolvedValue({
        id: 'tag-1',
        name: 'Old',
        slug: 'old',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      tagRepository.findByName.mockResolvedValue(null);
      tagRepository.findBySlug.mockResolvedValue(null);
      tagRepository.update.mockResolvedValue({
        id: 'tag-1',
        name: 'Updated',
        slug: 'updated',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await usecase.execute({
        id: 'tag-1',
        input: { name: 'Updated', slug: 'updated' },
        session: adminSession,
      });

      expect(result).toEqual({
        id: 'tag-1',
        name: 'Updated',
        slug: 'updated',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw error when tag not found', async () => {
      tagRepository.findById.mockResolvedValue(null);

      await expect(
        usecase.execute({
          id: 'tag-1',
          input: { name: 'Updated' },
          session: adminSession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should throw error when name already exists', async () => {
      tagRepository.findById.mockResolvedValue({
        id: 'tag-1',
        name: 'Old',
        slug: 'old',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      tagRepository.findByName.mockResolvedValue({
        id: 'tag-2',
        name: 'Updated',
        slug: 'other',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        usecase.execute({
          id: 'tag-1',
          input: { name: 'Updated' },
          session: adminSession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should throw error when user has no permission', async () => {
      await expect(
        usecase.execute({
          id: 'tag-1',
          input: { name: 'Updated' },
          session: userSession,
        }),
      ).rejects.toThrow(DomainError);
    });
  });

  describe('DeleteTagUsecase', () => {
    let usecase: DeleteTagUsecase;
    let tagRepository: jest.Mocked<TagRepository>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteTagUsecase,
          { provide: TagRepository, useValue: { findById: jest.fn(), delete: jest.fn() } },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<DeleteTagUsecase>(DeleteTagUsecase);
      tagRepository = module.get(TagRepository);
    });

    it('should delete tag successfully', async () => {
      tagRepository.findById.mockResolvedValue({
        id: 'tag-1',
        name: 'Test',
        slug: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await usecase.execute({ id: 'tag-1', session: adminSession });

      expect(tagRepository.delete).toHaveBeenCalled();
    });

    it('should throw error when tag not found', async () => {
      tagRepository.findById.mockResolvedValue(null);

      await expect(usecase.execute({ id: 'tag-1', session: adminSession })).rejects.toThrow(
        DomainError,
      );
    });

    it('should throw error when user has no permission', async () => {
      await expect(usecase.execute({ id: 'tag-1', session: userSession })).rejects.toThrow(
        DomainError,
      );
    });
  });

  describe('CreateCommentUsecase', () => {
    let usecase: CreateCommentUsecase;
    let commentRepository: jest.Mocked<CommentRepository>;
    let commentQueryService: jest.Mocked<CommentQueryService>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CreateCommentUsecase,
          {
            provide: CommentRepository,
            useValue: { create: jest.fn(), getCommentDepth: jest.fn() },
          },
          { provide: CommentQueryService, useValue: { getCommentById: jest.fn() } },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<CreateCommentUsecase>(CreateCommentUsecase);
      commentRepository = module.get(CommentRepository);
      commentQueryService = module.get(CommentQueryService);
    });

    it('should create comment successfully with PENDING status', async () => {
      const now = new Date();
      commentRepository.create.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
      commentQueryService.getCommentById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        input: {
          articleId: 'article-1',
          authorName: 'Test Author',
          authorEmail: 'test@example.com',
          content: 'Test',
        },
        session: userSession,
      });

      expect(result).toEqual({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: now,
        updatedAt: now,
      });
    });

    it('should generate avatar from email MD5', async () => {
      const now = new Date();
      commentRepository.create.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        authorAvatar:
          'https://www.gravatar.com/avatar/098f6bcd4621d373cade4e832627b4f6?d=identicon',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
      commentQueryService.getCommentById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        authorAvatar:
          'https://www.gravatar.com/avatar/098f6bcd4621d373cade4e832627b4f6?d=identicon',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: now,
        updatedAt: now,
      });

      await usecase.execute({
        input: {
          articleId: 'article-1',
          authorName: 'Test Author',
          authorEmail: 'test@example.com',
          content: 'Test',
        },
        session: userSession,
      });

      expect(commentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          authorAvatar:
            'https://www.gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?d=identicon',
        }),
        expect.anything(),
      );
    });

    it('should throw error when comment depth exceeds limit', async () => {
      commentRepository.getCommentDepth.mockResolvedValue(3);

      await expect(
        usecase.execute({
          input: {
            articleId: 'article-1',
            authorName: 'Test Author',
            authorEmail: 'test@example.com',
            content: 'Test',
            parentId: 'parent-comment-id',
          },
          session: userSession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should create nested comment when depth is within limit', async () => {
      const now = new Date();
      commentRepository.getCommentDepth.mockResolvedValue(2);
      commentRepository.create.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: 'parent-comment-id',
        status: CommentStatus.PENDING,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
      commentQueryService.getCommentById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: 'parent-comment-id',
        status: CommentStatus.PENDING,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        input: {
          articleId: 'article-1',
          authorName: 'Test Author',
          authorEmail: 'test@example.com',
          content: 'Test',
          parentId: 'parent-comment-id',
        },
        session: userSession,
      });

      expect(result.parentId).toBe('parent-comment-id');
    });

    it('should throw error when comment not found after creation', async () => {
      commentRepository.create.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      commentQueryService.getCommentById.mockResolvedValue(null);

      await expect(
        usecase.execute({
          input: {
            articleId: 'article-1',
            authorName: 'Test Author',
            authorEmail: 'test@example.com',
            content: 'Test',
          },
          session: userSession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should throw error when user has no permission', async () => {
      await expect(
        usecase.execute({
          input: {
            articleId: 'article-1',
            authorName: 'Test Author',
            authorEmail: 'test@example.com',
            content: 'Test',
          },
          session: emptySession,
        }),
      ).rejects.toThrow(DomainError);
    });
  });

  describe('UpdateCommentStatusUsecase', () => {
    let usecase: UpdateCommentStatusUsecase;
    let commentRepository: jest.Mocked<CommentRepository>;
    let commentQueryService: jest.Mocked<CommentQueryService>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UpdateCommentStatusUsecase,
          {
            provide: CommentRepository,
            useValue: { findById: jest.fn(), updateStatus: jest.fn() },
          },
          { provide: CommentQueryService, useValue: { getCommentById: jest.fn() } },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<UpdateCommentStatusUsecase>(UpdateCommentStatusUsecase);
      commentRepository = module.get(CommentRepository);
      commentQueryService = module.get(CommentQueryService);
    });

    it('should update comment status successfully', async () => {
      commentRepository.findById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      const now = new Date();
      commentQueryService.getCommentById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({
        id: 'comment-1',
        status: CommentStatus.APPROVED,
        session: adminSession,
      });

      expect(result).toEqual({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
      });
    });

    it('should throw error when comment not found', async () => {
      commentRepository.findById.mockResolvedValue(null);

      await expect(
        usecase.execute({
          id: 'comment-1',
          status: CommentStatus.APPROVED,
          session: adminSession,
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should throw error when user has no permission', async () => {
      commentRepository.findById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(
        usecase.execute({
          id: 'comment-1',
          status: CommentStatus.APPROVED,
          session: userSession,
        }),
      ).rejects.toThrow(DomainError);
    });
  });

  describe('DeleteCommentUsecase', () => {
    let usecase: DeleteCommentUsecase;
    let commentRepository: jest.Mocked<CommentRepository>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteCommentUsecase,
          {
            provide: CommentRepository,
            useValue: {
              findById: jest.fn(),
              softDelete: jest.fn(),
              findChildrenRecursively: jest.fn(),
            },
          },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<DeleteCommentUsecase>(DeleteCommentUsecase);
      commentRepository = module.get(CommentRepository);
    });

    it('should delete comment successfully', async () => {
      commentRepository.findById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      commentRepository.findChildrenRecursively.mockResolvedValue([]);

      await usecase.execute({ id: 'comment-1', session: adminSession });

      expect(commentRepository.softDelete).toHaveBeenCalledWith('comment-1', expect.anything());
    });

    it('should cascade delete child comments', async () => {
      commentRepository.findById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      commentRepository.findChildrenRecursively.mockResolvedValue([
        { id: 'child-1', parentId: 'comment-1' },
        { id: 'child-2', parentId: 'child-1' },
      ] as any);

      await usecase.execute({ id: 'comment-1', session: adminSession });

      expect(commentRepository.softDelete).toHaveBeenCalledTimes(3);
      expect(commentRepository.softDelete).toHaveBeenCalledWith('child-1', expect.anything());
      expect(commentRepository.softDelete).toHaveBeenCalledWith('child-2', expect.anything());
      expect(commentRepository.softDelete).toHaveBeenCalledWith('comment-1', expect.anything());
    });

    it('should throw error when comment not found', async () => {
      commentRepository.findById.mockResolvedValue(null);

      await expect(usecase.execute({ id: 'comment-1', session: adminSession })).rejects.toThrow(
        DomainError,
      );
    });

    it('should throw error when user has no permission', async () => {
      commentRepository.findById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(usecase.execute({ id: 'comment-1', session: userSession })).rejects.toThrow(
        DomainError,
      );
    });
  });

  describe('ApproveCommentUsecase', () => {
    let usecase: ApproveCommentUsecase;
    let commentRepository: jest.Mocked<CommentRepository>;
    let commentQueryService: jest.Mocked<CommentQueryService>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ApproveCommentUsecase,
          {
            provide: CommentRepository,
            useValue: { findById: jest.fn(), updateStatus: jest.fn() },
          },
          { provide: CommentQueryService, useValue: { getCommentById: jest.fn() } },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<ApproveCommentUsecase>(ApproveCommentUsecase);
      commentRepository = module.get(CommentRepository);
      commentQueryService = module.get(CommentQueryService);
    });

    it('should approve comment successfully', async () => {
      const now = new Date();
      commentRepository.findById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
      commentRepository.updateStatus.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
      commentQueryService.getCommentById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({ id: 'comment-1', session: adminSession });

      expect(result.status).toBe(CommentStatus.APPROVED);
      expect(commentRepository.updateStatus).toHaveBeenCalledWith(
        'comment-1',
        CommentStatus.APPROVED,
        expect.anything(),
      );
    });

    it('should throw error when comment not found', async () => {
      commentRepository.findById.mockResolvedValue(null);

      await expect(usecase.execute({ id: 'comment-1', session: adminSession })).rejects.toThrow(
        DomainError,
      );
    });

    it('should throw error when user has no permission', async () => {
      commentRepository.findById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(usecase.execute({ id: 'comment-1', session: userSession })).rejects.toThrow(
        DomainError,
      );
    });
  });

  describe('RejectCommentUsecase', () => {
    let usecase: RejectCommentUsecase;
    let commentRepository: jest.Mocked<CommentRepository>;
    let commentQueryService: jest.Mocked<CommentQueryService>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          RejectCommentUsecase,
          {
            provide: CommentRepository,
            useValue: { findById: jest.fn(), updateStatus: jest.fn() },
          },
          { provide: CommentQueryService, useValue: { getCommentById: jest.fn() } },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<RejectCommentUsecase>(RejectCommentUsecase);
      commentRepository = module.get(CommentRepository);
      commentQueryService = module.get(CommentQueryService);
    });

    it('should reject comment successfully', async () => {
      const now = new Date();
      commentRepository.findById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
      commentRepository.updateStatus.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.REJECTED,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
      commentQueryService.getCommentById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.REJECTED,
        createdAt: now,
        updatedAt: now,
      });

      const result = await usecase.execute({ id: 'comment-1', session: adminSession });

      expect(result.status).toBe(CommentStatus.REJECTED);
      expect(commentRepository.updateStatus).toHaveBeenCalledWith(
        'comment-1',
        CommentStatus.REJECTED,
        expect.anything(),
      );
    });

    it('should throw error when comment not found', async () => {
      commentRepository.findById.mockResolvedValue(null);

      await expect(usecase.execute({ id: 'comment-1', session: adminSession })).rejects.toThrow(
        DomainError,
      );
    });

    it('should throw error when user has no permission', async () => {
      commentRepository.findById.mockResolvedValue({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Test',
        parentId: null,
        status: CommentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(usecase.execute({ id: 'comment-1', session: userSession })).rejects.toThrow(
        DomainError,
      );
    });
  });
});
