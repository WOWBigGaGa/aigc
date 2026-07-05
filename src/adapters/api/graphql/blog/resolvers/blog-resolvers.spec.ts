import { Test, TestingModule } from '@nestjs/testing';
import { ArticleResolver } from './article.resolver';
import { CommentResolver } from './comment.resolver';
import { CategoryResolver } from './category.resolver';
import { TagResolver } from './tag.resolver';
import { DashboardResolver } from './dashboard.resolver';
import { ArticleQueryService } from '@src/modules/blog/queries/article.query.service';
import { CommentQueryService } from '@src/modules/blog/queries/comment.query.service';
import { CategoryQueryService } from '@src/modules/blog/queries/category.query.service';
import { TagQueryService } from '@src/modules/blog/queries/tag.query.service';
import { CommentRepository } from '@src/modules/blog/repositories/comment.repository';
import { CategoryRepository } from '@src/modules/blog/repositories/category.repository';
import { TagRepository } from '@src/modules/blog/repositories/tag.repository';
import { CreateArticleUsecase } from '@usecases/blog/create-article.usecase';
import { UpdateArticleUsecase } from '@usecases/blog/update-article.usecase';
import { DeleteArticleUsecase } from '@usecases/blog/delete-article.usecase';
import { CreateCommentUsecase } from '@usecases/blog/create-comment.usecase';
import { ApproveCommentUsecase } from '@usecases/blog/approve-comment.usecase';
import { RejectCommentUsecase } from '@usecases/blog/reject-comment.usecase';
import { DeleteCommentUsecase } from '@usecases/blog/delete-comment.usecase';
import { CreateCategoryUsecase } from '@usecases/blog/create-category.usecase';
import { UpdateCategoryUsecase } from '@usecases/blog/update-category.usecase';
import { DeleteCategoryUsecase } from '@usecases/blog/delete-category.usecase';
import { CreateTagUsecase } from '@usecases/blog/create-tag.usecase';
import { UpdateTagUsecase } from '@usecases/blog/update-tag.usecase';
import { DeleteTagUsecase } from '@usecases/blog/delete-tag.usecase';
import { ArticleStatus, CommentStatus } from '@src/modules/blog/blog.types';

describe('Blog Resolvers', () => {
  let articleResolver: ArticleResolver;
  let commentResolver: CommentResolver;
  let categoryResolver: CategoryResolver;
  let tagResolver: TagResolver;
  let dashboardResolver: DashboardResolver;

  let articleQueryService: jest.Mocked<ArticleQueryService>;
  let commentQueryService: jest.Mocked<CommentQueryService>;
  let categoryQueryService: jest.Mocked<CategoryQueryService>;
  let tagQueryService: jest.Mocked<TagQueryService>;
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let tagRepository: jest.Mocked<TagRepository>;

  beforeAll(async () => {
    articleQueryService = {
      getArticles: jest.fn(),
      getArticleById: jest.fn(),
      getArchives: jest.fn(),
      getArticleStats: jest.fn(),
      incrementViewCount: jest.fn(),
      incrementLikeCount: jest.fn(),
    } as any;

    commentQueryService = {
      getCommentsByArticle: jest.fn(),
      getPendingComments: jest.fn(),
      getTotalCommentCount: jest.fn(),
    } as any;

    categoryQueryService = {
      getAllCategories: jest.fn(),
      getCategoryCount: jest.fn(),
    } as any;

    tagQueryService = {
      getAllTags: jest.fn(),
      getTagCount: jest.fn(),
    } as any;

    categoryRepository = {
      findAll: jest.fn(),
    } as any;

    tagRepository = {
      findAll: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleResolver,
        CommentResolver,
        CategoryResolver,
        TagResolver,
        DashboardResolver,
        { provide: ArticleQueryService, useValue: articleQueryService },
        { provide: CommentQueryService, useValue: commentQueryService },
        { provide: CategoryQueryService, useValue: categoryQueryService },
        { provide: TagQueryService, useValue: tagQueryService },
        { provide: CategoryRepository, useValue: categoryRepository },
        { provide: TagRepository, useValue: tagRepository },
        { provide: CommentRepository, useValue: {} },
        { provide: CreateArticleUsecase, useValue: { execute: jest.fn() } },
        { provide: UpdateArticleUsecase, useValue: { execute: jest.fn() } },
        { provide: DeleteArticleUsecase, useValue: { execute: jest.fn() } },
        { provide: CreateCommentUsecase, useValue: { execute: jest.fn() } },
        { provide: ApproveCommentUsecase, useValue: { execute: jest.fn() } },
        { provide: RejectCommentUsecase, useValue: { execute: jest.fn() } },
        { provide: DeleteCommentUsecase, useValue: { execute: jest.fn() } },
        { provide: CreateCategoryUsecase, useValue: { execute: jest.fn() } },
        { provide: UpdateCategoryUsecase, useValue: { execute: jest.fn() } },
        { provide: DeleteCategoryUsecase, useValue: { execute: jest.fn() } },
        { provide: CreateTagUsecase, useValue: { execute: jest.fn() } },
        { provide: UpdateTagUsecase, useValue: { execute: jest.fn() } },
        { provide: DeleteTagUsecase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    articleResolver = module.get(ArticleResolver);
    commentResolver = module.get(CommentResolver);
    categoryResolver = module.get(CategoryResolver);
    tagResolver = module.get(TagResolver);
    dashboardResolver = module.get(DashboardResolver);
  });

  describe('ArticleResolver', () => {
    it('should return paginated articles', async () => {
      const mockResult = {
        items: [
          {
            id: '1',
            title: 'Test',
            content: '',
            coverImage: null,
            summary: '',
            status: ArticleStatus.PUBLISHED,
            viewCount: 0,
            likeCount: 0,
            isPinned: false,
            authorId: '1',
            categoryId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            publishedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        pageInfo: { hasNext: false },
      };
      articleQueryService.getArticles.mockResolvedValue(mockResult);

      const result = await articleResolver.articles({ page: 1, limit: 10 }, {});

      expect(articleQueryService.getArticles).toHaveBeenCalled();
      expect(result.total).toBe(1);
    });

    it('should return single article', async () => {
      const mockArticle = {
        id: '1',
        title: 'Test',
        content: '',
        coverImage: null,
        summary: '',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        authorId: '1',
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
      };
      articleQueryService.getArticleById.mockResolvedValue(mockArticle);

      const result = await articleResolver.article('1');

      expect(articleQueryService.getArticleById).toHaveBeenCalledWith('1');
      expect(result?.id).toBe('1');
    });

    it('should return null for non-existent article', async () => {
      articleQueryService.getArticleById.mockResolvedValue(null);

      const result = await articleResolver.article('non-existent');

      expect(result).toBeNull();
    });

    it('should increment view count', async () => {
      const mockArticle = {
        id: '1',
        title: 'Test',
        content: '',
        coverImage: null,
        summary: '',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        authorId: '1',
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
      };
      articleQueryService.incrementViewCount.mockResolvedValue();
      articleQueryService.getArticleById.mockResolvedValue({ ...mockArticle, viewCount: 1 });

      const result = await articleResolver.incrementViewCount('1');

      expect(articleQueryService.incrementViewCount).toHaveBeenCalledWith('1');
      expect(result?.viewCount).toBe(1);
    });

    it('should increment like count', async () => {
      const mockArticle = {
        id: '1',
        title: 'Test',
        content: '',
        coverImage: null,
        summary: '',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        authorId: '1',
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
      };
      articleQueryService.incrementLikeCount.mockResolvedValue();
      articleQueryService.getArticleById.mockResolvedValue({ ...mockArticle, likeCount: 1 });

      const result = await articleResolver.incrementLikeCount('1');

      expect(articleQueryService.incrementLikeCount).toHaveBeenCalledWith('1');
      expect(result?.likeCount).toBe(1);
    });
  });

  describe('CommentResolver', () => {
    it('should return comments for article', async () => {
      const mockResult = {
        items: [
          {
            id: '1',
            content: 'Test',
            articleId: '1',
            authorName: 'Test',
            authorEmail: 'test@test.com',
            authorAvatar: '',
            status: CommentStatus.APPROVED,
            parentId: null,
            children: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        pageInfo: { hasNext: false },
      };
      commentQueryService.getCommentsByArticle.mockResolvedValue(mockResult);

      const result = await commentResolver.comments('article-1');

      expect(commentQueryService.getCommentsByArticle).toHaveBeenCalled();
      expect(result.total).toBe(1);
    });

    it('should return pending comments', async () => {
      const mockResult = {
        items: [
          {
            id: '1',
            content: 'Test',
            articleId: '1',
            authorName: 'Test',
            authorEmail: 'test@test.com',
            authorAvatar: '',
            status: CommentStatus.PENDING,
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        pageInfo: { hasNext: false },
      };
      commentQueryService.getPendingComments.mockResolvedValue(mockResult);

      const result = await commentResolver.pendingComments({ page: 1, limit: 20 });

      expect(commentQueryService.getPendingComments).toHaveBeenCalled();
      expect(result.total).toBe(1);
    });
  });

  describe('CategoryResolver', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Test',
          slug: 'test',
          description: '',
          parentId: null,
          sort: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      categoryRepository.findAll.mockResolvedValue(mockCategories);

      const result = await categoryResolver.categories();

      expect(categoryRepository.findAll).toHaveBeenCalled();
      expect(result.length).toBe(1);
    });

    it('should return empty array when no categories', async () => {
      categoryRepository.findAll.mockResolvedValue([]);

      const result = await categoryResolver.categories();

      expect(result).toEqual([]);
    });
  });

  describe('TagResolver', () => {
    it('should return all tags', async () => {
      const mockTags = [
        {
          id: '1',
          name: 'Test',
          slug: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      tagRepository.findAll.mockResolvedValue(mockTags);

      const result = await tagResolver.tags();

      expect(tagRepository.findAll).toHaveBeenCalled();
      expect(result.length).toBe(1);
    });

    it('should return empty array when no tags', async () => {
      tagRepository.findAll.mockResolvedValue([]);

      const result = await tagResolver.tags();

      expect(result).toEqual([]);
    });
  });

  describe('DashboardResolver', () => {
    it('should return dashboard stats', async () => {
      categoryQueryService.getCategoryCount.mockResolvedValue(1);
      tagQueryService.getTagCount.mockResolvedValue(1);
      articleQueryService.getArticleStats.mockResolvedValue({
        totalViewCount: 100,
        totalLikeCount: 10,
        totalPublishedCount: 1,
      });
      commentQueryService.getPendingComments.mockResolvedValue({
        items: [],
        total: 5,
        page: 1,
        pageSize: 1,
        pageInfo: { hasNext: false },
      });
      commentQueryService.getTotalCommentCount.mockResolvedValue(20);

      const result = await dashboardResolver.dashboardStats();

      expect(result.categoryCount).toBe(1);
      expect(result.tagCount).toBe(1);
      expect(result.articleCount).toBe(1);
      expect(result.commentCount).toBe(20);
      expect(result.totalViewCount).toBe(100);
      expect(result.totalLikeCount).toBe(10);
      expect(result.pendingCommentCount).toBe(5);
    });

    it('should return archives', async () => {
      const mockArchives = [{ year: 2024, month: 1, count: 5 }];
      articleQueryService.getArchives.mockResolvedValue(mockArchives);

      const result = await dashboardResolver.archives();

      expect(articleQueryService.getArchives).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0].count).toBe(5);
    });

    it('should return zero stats when no data', async () => {
      categoryQueryService.getCategoryCount.mockResolvedValue(0);
      tagQueryService.getTagCount.mockResolvedValue(0);
      articleQueryService.getArticleStats.mockResolvedValue({
        totalViewCount: 0,
        totalLikeCount: 0,
        totalPublishedCount: 0,
      });
      commentQueryService.getPendingComments.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 1,
        pageInfo: { hasNext: false },
      });
      commentQueryService.getTotalCommentCount.mockResolvedValue(0);

      const result = await dashboardResolver.dashboardStats();

      expect(result.categoryCount).toBe(0);
      expect(result.tagCount).toBe(0);
      expect(result.articleCount).toBe(0);
      expect(result.commentCount).toBe(0);
      expect(result.totalViewCount).toBe(0);
      expect(result.totalLikeCount).toBe(0);
      expect(result.pendingCommentCount).toBe(0);
    });
  });
});
