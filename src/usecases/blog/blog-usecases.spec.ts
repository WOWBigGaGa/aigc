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
import { ArticleStatus, CommentStatus } from '@src/modules/blog/blog.types';

describe('Blog Usecases', () => {
  const mockTransactionRunner = {
    run: jest.fn((callback) => callback({})),
  };

  describe('CreateArticleUsecase', () => {
    let usecase: CreateArticleUsecase;
    let articleRepository: any;
    let tagRepository: any;
    let articleQueryService: any;

    beforeEach(async () => {
      articleRepository = {
        create: jest.fn().mockResolvedValue({ id: 'article-1', title: 'Test Article' }),
      };
      tagRepository = {};
      articleQueryService = {
        getArticleById: jest.fn().mockResolvedValue({ id: 'article-1', title: 'Test Article' }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CreateArticleUsecase,
          { provide: ArticleRepository, useValue: articleRepository },
          { provide: TagRepository, useValue: tagRepository },
          { provide: ArticleQueryService, useValue: articleQueryService },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<CreateArticleUsecase>(CreateArticleUsecase);
    });

    it('should create article successfully', async () => {
      const input = {
        title: 'Test Article',
        content: '# Hello World',
        summary: 'A test article',
      };

      const result = await usecase.execute({ input, authorId: 'author-1' });

      expect(result).toEqual({ id: 'article-1', title: 'Test Article' });
      expect(articleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Article',
          status: ArticleStatus.DRAFT,
        }),
        expect.any(Object),
      );
    });

    it('should throw error when article not found after creation', async () => {
      articleQueryService.getArticleById.mockResolvedValue(null);

      const input = {
        title: 'Test Article',
        content: '# Hello World',
        summary: 'A test article',
      };

      await expect(usecase.execute({ input, authorId: 'author-1' })).rejects.toThrow(DomainError);
    });
  });

  describe('UpdateArticleUsecase', () => {
    let usecase: UpdateArticleUsecase;
    let articleRepository: any;
    let tagRepository: any;
    let articleQueryService: any;

    beforeEach(async () => {
      articleRepository = {
        findById: jest.fn().mockResolvedValue({ id: 'article-1', publishedAt: null }),
        update: jest.fn().mockResolvedValue({ id: 'article-1' }),
      };
      tagRepository = {};
      articleQueryService = {
        getArticleById: jest.fn().mockResolvedValue({ id: 'article-1', title: 'Updated' }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UpdateArticleUsecase,
          { provide: ArticleRepository, useValue: articleRepository },
          { provide: TagRepository, useValue: tagRepository },
          { provide: ArticleQueryService, useValue: articleQueryService },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<UpdateArticleUsecase>(UpdateArticleUsecase);
    });

    it('should update article successfully', async () => {
      const input = { title: 'Updated Title' };

      const result = await usecase.execute({ id: 'article-1', input });

      expect(result).toEqual({ id: 'article-1', title: 'Updated' });
    });

    it('should set publishedAt when status changes to PUBLISHED', async () => {
      const input = { status: ArticleStatus.PUBLISHED };

      await usecase.execute({ id: 'article-1', input });

      expect(articleRepository.update).toHaveBeenCalledWith(
        'article-1',
        expect.objectContaining({
          status: ArticleStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        }),
        expect.any(Object),
      );
    });

    it('should throw error when article not found', async () => {
      articleRepository.findById.mockResolvedValue(null);

      await expect(usecase.execute({ id: 'non-existent', input: {} })).rejects.toThrow(DomainError);
    });
  });

  describe('DeleteArticleUsecase', () => {
    let usecase: DeleteArticleUsecase;
    let articleRepository: any;

    beforeEach(async () => {
      articleRepository = {
        findById: jest.fn().mockResolvedValue({ id: 'article-1' }),
        softDelete: jest.fn().mockResolvedValue({}),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteArticleUsecase,
          { provide: ArticleRepository, useValue: articleRepository },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<DeleteArticleUsecase>(DeleteArticleUsecase);
    });

    it('should delete article successfully', async () => {
      await usecase.execute({ id: 'article-1' });

      expect(articleRepository.softDelete).toHaveBeenCalled();
    });

    it('should throw error when article not found', async () => {
      articleRepository.findById.mockResolvedValue(null);

      await expect(usecase.execute({ id: 'non-existent' })).rejects.toThrow(DomainError);
    });
  });

  describe('CreateCategoryUsecase', () => {
    let usecase: CreateCategoryUsecase;
    let categoryRepository: any;

    beforeEach(async () => {
      categoryRepository = {
        findBySlug: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'category-1', name: 'Test Category' }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CreateCategoryUsecase,
          { provide: CategoryRepository, useValue: categoryRepository },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<CreateCategoryUsecase>(CreateCategoryUsecase);
    });

    it('should create category successfully', async () => {
      const input = { name: 'Test Category' };

      const result = await usecase.execute({ input });

      expect(result).toEqual({ id: 'category-1', name: 'Test Category' });
    });

    it('should throw error when slug already exists', async () => {
      categoryRepository.findBySlug.mockResolvedValue({ id: 'existing' });

      const input = { name: 'Test Category' };

      await expect(usecase.execute({ input })).rejects.toThrow(DomainError);
    });
  });

  describe('UpdateCategoryUsecase', () => {
    let usecase: UpdateCategoryUsecase;
    let categoryRepository: any;

    beforeEach(async () => {
      categoryRepository = {
        findById: jest.fn().mockResolvedValue({ id: 'category-1', slug: 'original-slug' }),
        findBySlug: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue({ id: 'category-1', name: 'Updated' }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UpdateCategoryUsecase,
          { provide: CategoryRepository, useValue: categoryRepository },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<UpdateCategoryUsecase>(UpdateCategoryUsecase);
    });

    it('should update category successfully', async () => {
      const input = { name: 'Updated Category' };

      const result = await usecase.execute({ id: 'category-1', input });

      expect(result).toEqual({ id: 'category-1', name: 'Updated' });
    });

    it('should throw error when category not found', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(usecase.execute({ id: 'non-existent', input: {} })).rejects.toThrow(DomainError);
    });

    it('should throw error when slug already exists', async () => {
      categoryRepository.findBySlug.mockResolvedValue({ id: 'different-category' });

      const input = { slug: 'existing-slug' };

      await expect(usecase.execute({ id: 'category-1', input })).rejects.toThrow(DomainError);
    });
  });

  describe('DeleteCategoryUsecase', () => {
    let usecase: DeleteCategoryUsecase;
    let categoryRepository: any;

    beforeEach(async () => {
      categoryRepository = {
        findById: jest.fn().mockResolvedValue({ id: 'category-1' }),
        delete: jest.fn().mockResolvedValue({}),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteCategoryUsecase,
          { provide: CategoryRepository, useValue: categoryRepository },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<DeleteCategoryUsecase>(DeleteCategoryUsecase);
    });

    it('should delete category successfully', async () => {
      await usecase.execute({ id: 'category-1' });

      expect(categoryRepository.delete).toHaveBeenCalled();
    });

    it('should throw error when category not found', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(usecase.execute({ id: 'non-existent' })).rejects.toThrow(DomainError);
    });
  });

  describe('CreateTagUsecase', () => {
    let usecase: CreateTagUsecase;
    let tagRepository: any;

    beforeEach(async () => {
      tagRepository = {
        findByName: jest.fn().mockResolvedValue(null),
        findBySlug: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'tag-1', name: 'Test Tag' }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CreateTagUsecase,
          { provide: TagRepository, useValue: tagRepository },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<CreateTagUsecase>(CreateTagUsecase);
    });

    it('should create tag successfully', async () => {
      const input = { name: 'Test Tag' };

      const result = await usecase.execute({ input });

      expect(result).toEqual({ id: 'tag-1', name: 'Test Tag' });
    });

    it('should throw error when name already exists', async () => {
      tagRepository.findByName.mockResolvedValue({ id: 'existing' });

      const input = { name: 'Existing Tag' };

      await expect(usecase.execute({ input })).rejects.toThrow(DomainError);
    });

    it('should throw error when slug already exists', async () => {
      tagRepository.findBySlug.mockResolvedValue({ id: 'existing' });

      const input = { name: 'Test Tag' };

      await expect(usecase.execute({ input })).rejects.toThrow(DomainError);
    });
  });

  describe('UpdateTagUsecase', () => {
    let usecase: UpdateTagUsecase;
    let tagRepository: any;

    beforeEach(async () => {
      tagRepository = {
        findById: jest.fn().mockResolvedValue({ id: 'tag-1', name: 'Original' }),
        findByName: jest.fn().mockResolvedValue(null),
        findBySlug: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue({ id: 'tag-1', name: 'Updated' }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UpdateTagUsecase,
          { provide: TagRepository, useValue: tagRepository },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<UpdateTagUsecase>(UpdateTagUsecase);
    });

    it('should update tag successfully', async () => {
      const input = { name: 'Updated Tag' };

      const result = await usecase.execute({ id: 'tag-1', input });

      expect(result).toEqual({ id: 'tag-1', name: 'Updated' });
    });

    it('should throw error when tag not found', async () => {
      tagRepository.findById.mockResolvedValue(null);

      await expect(usecase.execute({ id: 'non-existent', input: {} })).rejects.toThrow(DomainError);
    });

    it('should throw error when name already exists', async () => {
      tagRepository.findByName.mockResolvedValue({ id: 'different-tag' });

      const input = { name: 'Existing Name' };

      await expect(usecase.execute({ id: 'tag-1', input })).rejects.toThrow(DomainError);
    });
  });

  describe('DeleteTagUsecase', () => {
    let usecase: DeleteTagUsecase;
    let tagRepository: any;

    beforeEach(async () => {
      tagRepository = {
        findById: jest.fn().mockResolvedValue({ id: 'tag-1' }),
        delete: jest.fn().mockResolvedValue({}),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteTagUsecase,
          { provide: TagRepository, useValue: tagRepository },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<DeleteTagUsecase>(DeleteTagUsecase);
    });

    it('should delete tag successfully', async () => {
      await usecase.execute({ id: 'tag-1' });

      expect(tagRepository.delete).toHaveBeenCalled();
    });

    it('should throw error when tag not found', async () => {
      tagRepository.findById.mockResolvedValue(null);

      await expect(usecase.execute({ id: 'non-existent' })).rejects.toThrow(DomainError);
    });
  });

  describe('CreateCommentUsecase', () => {
    let usecase: CreateCommentUsecase;
    let commentRepository: any;
    let commentQueryService: any;

    beforeEach(async () => {
      commentRepository = {
        create: jest.fn().mockResolvedValue({ id: 'comment-1' }),
      };
      commentQueryService = {
        getCommentById: jest.fn().mockResolvedValue({ id: 'comment-1', content: 'Test' }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CreateCommentUsecase,
          { provide: CommentRepository, useValue: commentRepository },
          { provide: CommentQueryService, useValue: commentQueryService },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<CreateCommentUsecase>(CreateCommentUsecase);
    });

    it('should create comment successfully with PENDING status', async () => {
      const input = {
        articleId: 'article-1',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        content: 'Great article!',
      };

      const result = await usecase.execute({ input });

      expect(result).toEqual({ id: 'comment-1', content: 'Test' });
      expect(commentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: CommentStatus.PENDING,
        }),
        expect.any(Object),
      );
    });

    it('should throw error when comment not found after creation', async () => {
      commentQueryService.getCommentById.mockResolvedValue(null);

      const input = {
        articleId: 'article-1',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        content: 'Great article!',
      };

      await expect(usecase.execute({ input })).rejects.toThrow(DomainError);
    });
  });

  describe('UpdateCommentStatusUsecase', () => {
    let usecase: UpdateCommentStatusUsecase;
    let commentRepository: any;
    let commentQueryService: any;

    beforeEach(async () => {
      commentRepository = {
        findById: jest.fn().mockResolvedValue({ id: 'comment-1' }),
        updateStatus: jest.fn().mockResolvedValue({}),
      };
      commentQueryService = {
        getCommentById: jest
          .fn()
          .mockResolvedValue({ id: 'comment-1', status: CommentStatus.APPROVED }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UpdateCommentStatusUsecase,
          { provide: CommentRepository, useValue: commentRepository },
          { provide: CommentQueryService, useValue: commentQueryService },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<UpdateCommentStatusUsecase>(UpdateCommentStatusUsecase);
    });

    it('should update comment status successfully', async () => {
      const result = await usecase.execute({ id: 'comment-1', status: CommentStatus.APPROVED });

      expect(result.status).toBe(CommentStatus.APPROVED);
    });

    it('should throw error when comment not found', async () => {
      commentRepository.findById.mockResolvedValue(null);

      await expect(
        usecase.execute({ id: 'non-existent', status: CommentStatus.APPROVED }),
      ).rejects.toThrow(DomainError);
    });
  });

  describe('DeleteCommentUsecase', () => {
    let usecase: DeleteCommentUsecase;
    let commentRepository: any;

    beforeEach(async () => {
      commentRepository = {
        findById: jest.fn().mockResolvedValue({ id: 'comment-1' }),
        softDelete: jest.fn().mockResolvedValue({}),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteCommentUsecase,
          { provide: CommentRepository, useValue: commentRepository },
          { provide: TRANSACTION_RUNNER, useValue: mockTransactionRunner },
        ],
      }).compile();

      usecase = module.get<DeleteCommentUsecase>(DeleteCommentUsecase);
    });

    it('should delete comment successfully', async () => {
      await usecase.execute({ id: 'comment-1' });

      expect(commentRepository.softDelete).toHaveBeenCalled();
    });

    it('should throw error when comment not found', async () => {
      commentRepository.findById.mockResolvedValue(null);

      await expect(usecase.execute({ id: 'non-existent' })).rejects.toThrow(DomainError);
    });
  });
});
