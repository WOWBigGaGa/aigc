import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '@src/infrastructure/config/config.module';
import { DatabaseModule } from '@src/infrastructure/database/database.module';
import { TypeOrmTransactionModule } from '@src/infrastructure/database/transaction/typeorm-transaction.module';
import { BlogModule } from '@src/modules/blog/blog.module';
import { BlogGraphQLModule } from '@src/adapters/api/graphql/blog/blog.graphql.module';
import { ArticleEntity } from '@src/modules/blog/entities/article.entity';
import { CategoryEntity } from '@src/modules/blog/entities/category.entity';
import { CommentEntity } from '@src/modules/blog/entities/comment.entity';
import { TagEntity } from '@src/modules/blog/entities/tag.entity';
import { ArticleTagEntity } from '@src/modules/blog/entities/article-tag.entity';
import { ArticleRepository } from '@src/modules/blog/repositories/article.repository';
import { CategoryRepository } from '@src/modules/blog/repositories/category.repository';
import { CommentRepository } from '@src/modules/blog/repositories/comment.repository';
import { TagRepository } from '@src/modules/blog/repositories/tag.repository';
import { ArticleQueryService } from '@src/modules/blog/queries/article.query.service';
import { CommentQueryService } from '@src/modules/blog/queries/comment.query.service';
import { CreateArticleUsecase } from '@src/usecases/blog/create-article.usecase';
import { UpdateArticleUsecase } from '@src/usecases/blog/update-article.usecase';
import { DeleteArticleUsecase } from '@src/usecases/blog/delete-article.usecase';
import { CreateCategoryUsecase } from '@src/usecases/blog/create-category.usecase';
import { UpdateCategoryUsecase } from '@src/usecases/blog/update-category.usecase';
import { DeleteCategoryUsecase } from '@src/usecases/blog/delete-category.usecase';
import { CreateTagUsecase } from '@src/usecases/blog/create-tag.usecase';
import { UpdateTagUsecase } from '@src/usecases/blog/update-tag.usecase';
import { DeleteTagUsecase } from '@src/usecases/blog/delete-tag.usecase';
import { CreateCommentUsecase } from '@src/usecases/blog/create-comment.usecase';
import { UpdateCommentStatusUsecase } from '@src/usecases/blog/update-comment-status.usecase';
import { DeleteCommentUsecase } from '@src/usecases/blog/delete-comment.usecase';
import { ApproveCommentUsecase } from '@src/usecases/blog/approve-comment.usecase';
import { RejectCommentUsecase } from '@src/usecases/blog/reject-comment.usecase';
import { BlogUsecasesModule } from '@src/usecases/blog/blog-usecases.module';
import { ArticleStatus, CommentStatus } from '@src/modules/blog/blog.types';
import { DataSource, In, Like } from 'typeorm';
import type { UsecaseSession } from '@app-types/auth/session.types';
import { IdentityTypeEnum } from '@app-types/models/account.types';
import * as request from 'supertest';

describe('Blog Module (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let articleRepository: ArticleRepository;
  let categoryRepository: CategoryRepository;
  let commentRepository: CommentRepository;
  let tagRepository: TagRepository;
  let articleQueryService: ArticleQueryService;
  let commentQueryService: CommentQueryService;
  let createArticleUsecase: CreateArticleUsecase;
  let updateArticleUsecase: UpdateArticleUsecase;
  let deleteArticleUsecase: DeleteArticleUsecase;
  let createCategoryUsecase: CreateCategoryUsecase;
  let updateCategoryUsecase: UpdateCategoryUsecase;
  let deleteCategoryUsecase: DeleteCategoryUsecase;
  let createTagUsecase: CreateTagUsecase;
  let updateTagUsecase: UpdateTagUsecase;
  let deleteTagUsecase: DeleteTagUsecase;
  let createCommentUsecase: CreateCommentUsecase;
  let updateCommentStatusUsecase: UpdateCommentStatusUsecase;
  let deleteCommentUsecase: DeleteCommentUsecase;
  let approveCommentUsecase: ApproveCommentUsecase;
  let rejectCommentUsecase: RejectCommentUsecase;

  const adminSession: UsecaseSession = {
    accountId: 1,
    roles: [IdentityTypeEnum.ADMIN],
  };

  const userSession: UsecaseSession = {
    accountId: 2,
    roles: [IdentityTypeEnum.REGISTRANT],
  };

  const testPrefix = 'E2E_BLOG_';
  let seededArticleIds: string[] = [];
  let seededCategoryIds: string[] = [];
  let seededCommentIds: string[] = [];
  let seededTagIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppConfigModule,
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST || '127.0.0.1',
          port: parseInt(process.env.DB_PORT || '3306'),
          username: process.env.DB_USER || 'root',
          password: process.env.DB_PASS,
          database: process.env.DB_NAME || 'aigc_db',
          timezone: process.env.DB_TIMEZONE || '+08:00',
          synchronize: process.env.DB_SYNCHRONIZE === 'true',
          logging: process.env.DB_LOGGING === 'true',
          charset: 'utf8mb4',
          autoLoadEntities: true,
        }),
        TypeOrmTransactionModule,
        BlogModule,
        BlogUsecasesModule,
        BlogGraphQLModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    articleRepository = app.get(ArticleRepository);
    categoryRepository = app.get(CategoryRepository);
    commentRepository = app.get(CommentRepository);
    tagRepository = app.get(TagRepository);
    articleQueryService = app.get(ArticleQueryService);
    commentQueryService = app.get(CommentQueryService);
    createArticleUsecase = app.get<CreateArticleUsecase>(CreateArticleUsecase);
    updateArticleUsecase = app.get<UpdateArticleUsecase>(UpdateArticleUsecase);
    deleteArticleUsecase = app.get<DeleteArticleUsecase>(DeleteArticleUsecase);
    createCategoryUsecase = app.get<CreateCategoryUsecase>(CreateCategoryUsecase);
    updateCategoryUsecase = app.get<UpdateCategoryUsecase>(UpdateCategoryUsecase);
    deleteCategoryUsecase = app.get<DeleteCategoryUsecase>(DeleteCategoryUsecase);
    createTagUsecase = app.get<CreateTagUsecase>(CreateTagUsecase);
    updateTagUsecase = app.get<UpdateTagUsecase>(UpdateTagUsecase);
    deleteTagUsecase = app.get<DeleteTagUsecase>(DeleteTagUsecase);
    createCommentUsecase = app.get<CreateCommentUsecase>(CreateCommentUsecase);
    updateCommentStatusUsecase = app.get<UpdateCommentStatusUsecase>(UpdateCommentStatusUsecase);
    deleteCommentUsecase = app.get<DeleteCommentUsecase>(DeleteCommentUsecase);
    approveCommentUsecase = app.get<ApproveCommentUsecase>(ApproveCommentUsecase);
    rejectCommentUsecase = app.get<RejectCommentUsecase>(RejectCommentUsecase);

    await cleanupSeededData();
  });

  afterAll(async () => {
    try {
      await cleanupSeededData();
    } finally {
      if (app) await app.close();
    }
  });

  beforeEach(async () => {
    await cleanupSeededData();
  });

  describe('ArticleRepository', () => {
    it('should create, find, update and soft delete article', async () => {
      const articleData = {
        title: `${testPrefix}Test Article`,
        content: '# Hello World\n\nThis is a test article.',
        summary: 'A test article for e2e testing',
        authorId: 'test-author-id',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        coverImage: null,
        categoryId: null,
        publishedAt: new Date(),
      };

      const created = await articleRepository.create(articleData);
      seededArticleIds.push(created.id);

      expect(created.id).toBeDefined();
      expect(created.title).toBe(articleData.title);
      expect(created.status).toBe(ArticleStatus.PUBLISHED);

      const found = await articleRepository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found?.title).toBe(articleData.title);

      const updated = await articleRepository.update(created.id, {
        title: `${testPrefix}Updated Article`,
      });
      expect(updated.title).toBe(`${testPrefix}Updated Article`);

      await articleRepository.softDelete(created.id);

      const deleted = await articleRepository.findById(created.id);
      expect(deleted).toBeNull();
    });

    it('should increment view count', async () => {
      const articleData = {
        title: `${testPrefix}View Count Test`,
        content: 'Content',
        summary: 'View count test',
        authorId: 'test-author-id',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: new Date(),
      };

      const created = await articleRepository.create(articleData);
      seededArticleIds.push(created.id);

      await articleRepository.incrementViewCount(created.id);
      await articleRepository.incrementViewCount(created.id);

      const found = await articleRepository.findById(created.id);
      expect(found?.viewCount).toBe(2);
    });

    it('should increment like count', async () => {
      const articleData = {
        title: `${testPrefix}Like Count Test`,
        content: 'Content',
        summary: 'Like count test',
        authorId: 'test-author-id',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: new Date(),
      };

      const created = await articleRepository.create(articleData);
      seededArticleIds.push(created.id);

      await articleRepository.incrementLikeCount(created.id);

      const found = await articleRepository.findById(created.id);
      expect(found?.likeCount).toBe(1);
    });

    it('should find published articles with pagination', async () => {
      const articles = await Promise.all(
        Array.from({ length: 5 }).map((_, i) =>
          articleRepository.create({
            title: `${testPrefix}Published Article ${i}`,
            content: 'Content',
            summary: `Article ${i}`,
            authorId: 'test-author-id',
            status: ArticleStatus.PUBLISHED,
            viewCount: 0,
            likeCount: 0,
            isPinned: false,
            publishedAt: new Date(),
          }),
        ),
      );
      seededArticleIds.push(...articles.map((a) => a.id));

      const result = await articleRepository.findPublishedWithPagination(1, 3);

      expect(result.items.length).toBe(3);
      expect(result.total).toBe(5);
    });

    it('should not return deleted articles', async () => {
      const article = await articleRepository.create({
        title: `${testPrefix}To Be Deleted`,
        content: 'Content',
        summary: 'To be deleted',
        authorId: 'test-author-id',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: new Date(),
      });
      seededArticleIds.push(article.id);

      await articleRepository.softDelete(article.id);

      const result = await articleRepository.findPublishedWithPagination(1, 10);
      expect(result.items.every((item) => item.id !== article.id)).toBe(true);
    });
  });

  describe('CategoryRepository', () => {
    it('should create, find, update and delete category', async () => {
      const categoryData = {
        name: `${testPrefix}Test Category`,
        slug: `${testPrefix}test-category`,
        description: 'A test category',
        sort: 0,
        parentId: null,
      };

      const created = await categoryRepository.create(categoryData);
      seededCategoryIds.push(created.id);

      expect(created.id).toBeDefined();
      expect(created.name).toBe(categoryData.name);
      expect(created.slug).toBe(categoryData.slug);

      const found = await categoryRepository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe(categoryData.name);

      const foundBySlug = await categoryRepository.findBySlug(categoryData.slug);
      expect(foundBySlug).not.toBeNull();
      expect(foundBySlug?.id).toBe(created.id);

      const updated = await categoryRepository.update(created.id, {
        name: `${testPrefix}Updated Category`,
      });
      expect(updated.name).toBe(`${testPrefix}Updated Category`);

      await categoryRepository.delete(created.id);

      const deleted = await categoryRepository.findById(created.id);
      expect(deleted).toBeNull();
    });

    it('should find root categories', async () => {
      const rootCategory = await categoryRepository.create({
        name: `${testPrefix}Root Category`,
        slug: `${testPrefix}root-category`,
        sort: 0,
        parentId: null,
      });
      seededCategoryIds.push(rootCategory.id);

      const childCategory = await categoryRepository.create({
        name: `${testPrefix}Child Category`,
        slug: `${testPrefix}child-category`,
        sort: 1,
        parentId: rootCategory.id,
      });
      seededCategoryIds.push(childCategory.id);

      const rootCategories = await categoryRepository.findRootCategories();

      expect(rootCategories.length).toBeGreaterThanOrEqual(1);
      expect(rootCategories.some((c) => c.id === rootCategory.id)).toBe(true);
      expect(rootCategories.some((c) => c.id === childCategory.id)).toBe(false);
    });
  });

  describe('CommentRepository', () => {
    it('should create, find and update comment status', async () => {
      const article = await articleRepository.create({
        title: `${testPrefix}Comment Test Article`,
        content: 'Content',
        summary: 'Comment test',
        authorId: 'test-author-id',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: new Date(),
      });
      seededArticleIds.push(article.id);

      const commentData = {
        articleId: article.id,
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        authorAvatar: '',
        content: 'Great article!',
        status: CommentStatus.PENDING,
        parentId: null,
      };

      const created = await commentRepository.create(commentData);
      seededCommentIds.push(created.id);

      expect(created.id).toBeDefined();
      expect(created.content).toBe(commentData.content);
      expect(created.status).toBe(CommentStatus.PENDING);

      const found = await commentRepository.findById(created.id);
      expect(found).not.toBeNull();

      const approved = await commentRepository.updateStatus(created.id, CommentStatus.APPROVED);
      expect(approved.status).toBe(CommentStatus.APPROVED);

      await commentRepository.softDelete(created.id);

      const deleted = await commentRepository.findById(created.id);
      expect(deleted).toBeNull();
    });

    it('should find approved comments by article', async () => {
      const article = await articleRepository.create({
        title: `${testPrefix}Approved Comments Test`,
        content: 'Content',
        summary: 'Approved comments test',
        authorId: 'test-author-id',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: new Date(),
      });
      seededArticleIds.push(article.id);

      await Promise.all([
        commentRepository.create({
          articleId: article.id,
          authorName: 'Approved Author 1',
          authorEmail: 'approved1@example.com',
          authorAvatar: '',
          content: 'Approved comment 1',
          status: CommentStatus.APPROVED,
          parentId: null,
        }),
        commentRepository.create({
          articleId: article.id,
          authorName: 'Approved Author 2',
          authorEmail: 'approved2@example.com',
          authorAvatar: '',
          content: 'Approved comment 2',
          status: CommentStatus.APPROVED,
          parentId: null,
        }),
        commentRepository.create({
          articleId: article.id,
          authorName: 'Pending Author',
          authorEmail: 'pending@example.com',
          authorAvatar: '',
          content: 'Pending comment',
          status: CommentStatus.PENDING,
          parentId: null,
        }),
      ]).then((comments) => seededCommentIds.push(...comments.map((c) => c.id)));

      const result = await commentRepository.findApprovedByArticle(article.id, 1, 10);

      expect(result.total).toBe(2);
      expect(result.items.every((c) => c.status === CommentStatus.APPROVED)).toBe(true);
    });

    it('should find pending comments', async () => {
      await Promise.all([
        commentRepository.create({
          articleId: 'test-article-id',
          authorName: 'Pending 1',
          authorEmail: 'pending1@example.com',
          authorAvatar: '',
          content: 'Pending comment 1',
          status: CommentStatus.PENDING,
          parentId: null,
        }),
        commentRepository.create({
          articleId: 'test-article-id',
          authorName: 'Pending 2',
          authorEmail: 'pending2@example.com',
          authorAvatar: '',
          content: 'Pending comment 2',
          status: CommentStatus.PENDING,
          parentId: null,
        }),
      ]).then((comments) => seededCommentIds.push(...comments.map((c) => c.id)));

      const result = await commentRepository.findPendingComments(1, 10);

      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.items.every((c) => c.status === CommentStatus.PENDING)).toBe(true);
    });
  });

  describe('ArticleQueryService', () => {
    it('should get articles with pagination', async () => {
      const articles = await Promise.all(
        Array.from({ length: 3 }).map((_, i) =>
          articleRepository.create({
            title: `${testPrefix}Query Service Article ${i}`,
            content: 'Content',
            summary: `Article ${i}`,
            authorId: 'test-author-id',
            status: ArticleStatus.PUBLISHED,
            viewCount: 0,
            likeCount: 0,
            isPinned: false,
            publishedAt: new Date(),
          }),
        ),
      );
      seededArticleIds.push(...articles.map((a) => a.id));

      const result = await articleQueryService.getArticles({}, { page: 1, limit: 10 });

      expect(result.items.length).toBeGreaterThanOrEqual(3);
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.page).toBe(1);

      const foundTitles = result.items.map((item) => item.title);
      articles.forEach((article) => {
        expect(foundTitles).toContain(article.title);
      });
    });

    it('should get article by ID', async () => {
      const article = await articleRepository.create({
        title: `${testPrefix}Get By ID Article`,
        content: 'Content',
        summary: 'Get by ID test',
        authorId: 'test-author-id',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: new Date(),
      });
      seededArticleIds.push(article.id);

      const found = await articleQueryService.getArticleById(article.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(article.id);
      expect(found?.title).toBe(article.title);
    });

    it('should return null for non-existent article', async () => {
      const found = await articleQueryService.getArticleById('non-existent-id');

      expect(found).toBeNull();
    });
  });

  describe('CommentQueryService', () => {
    it('should get comments by article with tree structure', async () => {
      const article = await articleRepository.create({
        title: `${testPrefix}Comment Tree Test`,
        content: 'Content',
        summary: 'Comment tree test',
        authorId: 'test-author-id',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: new Date(),
      });
      seededArticleIds.push(article.id);

      const parentComment = await commentRepository.create({
        articleId: article.id,
        authorName: 'Parent Author',
        authorEmail: 'parent@example.com',
        authorAvatar: '',
        content: 'Parent comment',
        status: CommentStatus.APPROVED,
        parentId: null,
      });
      seededCommentIds.push(parentComment.id);

      const replyComment = await commentRepository.create({
        articleId: article.id,
        authorName: 'Reply Author',
        authorEmail: 'reply@example.com',
        authorAvatar: '',
        content: 'Reply comment',
        status: CommentStatus.APPROVED,
        parentId: parentComment.id,
      });
      seededCommentIds.push(replyComment.id);

      const result = await commentQueryService.getCommentsByArticle(article.id, {
        page: 1,
        limit: 10,
      });

      expect(result.items.length).toBe(1);
      expect(result.items[0].children.length).toBe(1);
      expect(result.items[0].id).toBe(parentComment.id);
      expect(result.items[0].children[0].id).toBe(replyComment.id);
    });
  });

  describe('TagRepository', () => {
    it('should create, find, update and delete tag', async () => {
      const tagData = {
        name: `${testPrefix}Test Tag`,
        slug: `${testPrefix}test-tag`,
      };

      const created = await tagRepository.create(tagData);
      seededTagIds.push(created.id);

      expect(created.id).toBeDefined();
      expect(created.name).toBe(tagData.name);
      expect(created.slug).toBe(tagData.slug);

      const found = await tagRepository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe(tagData.name);

      const updated = await tagRepository.update(created.id, {
        name: `${testPrefix}Updated Tag`,
      });
      expect(updated.name).toBe(`${testPrefix}Updated Tag`);

      await tagRepository.delete(created.id);

      const deleted = await tagRepository.findById(created.id);
      expect(deleted).toBeNull();
    });

    it('should add tags to article', async () => {
      const article = await articleRepository.create({
        title: `${testPrefix}Tagged Article`,
        content: 'Content',
        summary: 'Tagged article',
        authorId: 'test-author-id',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: new Date(),
      });
      seededArticleIds.push(article.id);

      const tag = await tagRepository.create({
        name: `${testPrefix}Test Tag`,
        slug: `${testPrefix}test-tag`,
      });
      seededTagIds.push(tag.id);

      await tagRepository.addTagsToArticle(article.id, [tag.id]);

      const foundTags = await tagRepository.getTagsByArticle(article.id);
      expect(foundTags.length).toBe(1);
      expect(foundTags[0].id).toBe(tag.id);
    });

    it('should update article tags', async () => {
      const article = await articleRepository.create({
        title: `${testPrefix}Tag Update Article`,
        content: 'Content',
        summary: 'Tag update test',
        authorId: 'test-author-id',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: new Date(),
      });
      seededArticleIds.push(article.id);

      const tag1 = await tagRepository.create({
        name: `${testPrefix}Tag 1`,
        slug: `${testPrefix}tag-1`,
      });
      const tag2 = await tagRepository.create({
        name: `${testPrefix}Tag 2`,
        slug: `${testPrefix}tag-2`,
      });
      const tag3 = await tagRepository.create({
        name: `${testPrefix}Tag 3`,
        slug: `${testPrefix}tag-3`,
      });
      seededTagIds.push(tag1.id, tag2.id, tag3.id);

      await tagRepository.updateArticleTags(article.id, [tag1.id, tag2.id]);
      let tags = await tagRepository.getTagsByArticle(article.id);
      expect(tags.length).toBe(2);

      await tagRepository.updateArticleTags(article.id, [tag2.id, tag3.id]);
      tags = await tagRepository.getTagsByArticle(article.id);
      expect(tags.length).toBe(2);
      expect(tags.some((t: TagEntity) => t.id === tag2.id)).toBe(true);
      expect(tags.some((t: TagEntity) => t.id === tag3.id)).toBe(true);
    });
  });

  describe('ArticleQueryService - Aggregate', () => {
    it('should get archives', async () => {
      await Promise.all(
        Array.from({ length: 3 }).map((_, i) =>
          articleRepository.create({
            title: `${testPrefix}Archive Article ${i}`,
            content: 'Content',
            summary: `Archive article ${i}`,
            authorId: 'test-author-id',
            status: ArticleStatus.PUBLISHED,
            viewCount: 0,
            likeCount: 0,
            isPinned: false,
            publishedAt: new Date(),
          }),
        ),
      ).then((articles) => seededArticleIds.push(...articles.map((a) => a.id)));

      const result = await articleQueryService.getArchives();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].year).toBeDefined();
      expect(result[0].month).toBeDefined();
      expect(result[0].count).toBeDefined();
    });

    it('should get category stats', async () => {
      const category = await categoryRepository.create({
        name: `${testPrefix}Stats Category`,
        slug: `${testPrefix}stats-category`,
        sort: 0,
        parentId: null,
      });
      seededCategoryIds.push(category.id);

      await Promise.all(
        Array.from({ length: 2 }).map((_, i) =>
          articleRepository.create({
            title: `${testPrefix}Category Stats Article ${i}`,
            content: 'Content',
            summary: `Article ${i}`,
            authorId: 'test-author-id',
            status: ArticleStatus.PUBLISHED,
            viewCount: 0,
            likeCount: 0,
            isPinned: false,
            categoryId: category.id,
            publishedAt: new Date(),
          }),
        ),
      ).then((articles) => seededArticleIds.push(...articles.map((a) => a.id)));

      const result = await articleQueryService.getCategoryStats();

      expect(Array.isArray(result)).toBe(true);
      const found = result.find((stat) => stat.categoryId === category.id);
      expect(found).toBeDefined();
      expect(found?.articleCount).toBe(2);
    });
  });

  describe('Blog Usecases', () => {
    describe('Article Usecases', () => {
      it('should create, update and delete article', async () => {
        const created = await createArticleUsecase.execute({
          input: {
            title: `${testPrefix}Usecase Article`,
            content: '# Usecase Test',
            summary: 'Usecase test article',
          },
          authorId: '1',
          session: adminSession,
        });
        seededArticleIds.push(created.id);

        expect(created.id).toBeDefined();
        expect(created.title).toBe(`${testPrefix}Usecase Article`);
        expect(created.status).toBe(ArticleStatus.DRAFT);

        const updated = await updateArticleUsecase.execute({
          id: created.id,
          input: { title: `${testPrefix}Updated Usecase Article` },
          session: adminSession,
        });
        expect(updated.title).toBe(`${testPrefix}Updated Usecase Article`);

        const published = await updateArticleUsecase.execute({
          id: created.id,
          input: { status: ArticleStatus.PUBLISHED },
          session: adminSession,
        });
        expect(published.status).toBe(ArticleStatus.PUBLISHED);
        expect(published.publishedAt).not.toBeNull();

        await deleteArticleUsecase.execute({
          id: created.id,
          session: adminSession,
        });

        const deleted = await articleRepository.findById(created.id);
        expect(deleted).toBeNull();
      });
    });

    describe('Category Usecases', () => {
      it('should create, update and delete category', async () => {
        const created = await createCategoryUsecase.execute({
          input: {
            name: `${testPrefix}Usecase Category`,
            slug: 'e2e-blog-usecase-category',
          },
          session: adminSession,
        });
        seededCategoryIds.push(created.id);

        expect(created.id).toBeDefined();
        expect(created.name).toBe(`${testPrefix}Usecase Category`);

        const updated = await updateCategoryUsecase.execute({
          id: created.id,
          input: { name: `${testPrefix}Updated Usecase Category` },
          session: adminSession,
        });
        expect(updated.name).toBe(`${testPrefix}Updated Usecase Category`);

        await deleteCategoryUsecase.execute({ id: created.id, session: adminSession });

        const deleted = await categoryRepository.findById(created.id);
        expect(deleted).toBeNull();
      });

      it('should throw error when creating category with existing slug', async () => {
        await categoryRepository.create({
          name: `${testPrefix}Existing Category`,
          slug: 'e2e-blog-existing-slug',
          sort: 0,
          parentId: null,
        });

        await expect(
          createCategoryUsecase.execute({
            input: { name: `${testPrefix}New Category`, slug: 'e2e-blog-existing-slug' },
            session: adminSession,
          }),
        ).rejects.toThrow();
      });
    });

    describe('Tag Usecases', () => {
      it('should create, update and delete tag', async () => {
        const created = await createTagUsecase.execute({
          input: { name: `${testPrefix}Usecase Tag` },
          session: adminSession,
        });
        seededTagIds.push(created.id);

        expect(created.id).toBeDefined();
        expect(created.name).toBe(`${testPrefix}Usecase Tag`);

        const updated = await updateTagUsecase.execute({
          id: created.id,
          input: { name: `${testPrefix}Updated Usecase Tag` },
          session: adminSession,
        });
        expect(updated.name).toBe(`${testPrefix}Updated Usecase Tag`);

        await deleteTagUsecase.execute({ id: created.id, session: adminSession });

        const deleted = await tagRepository.findById(created.id);
        expect(deleted).toBeNull();
      });

      it('should throw error when creating tag with existing name', async () => {
        await tagRepository.create({
          name: `${testPrefix}Existing Tag`,
          slug: `${testPrefix}existing-tag`,
        });

        await expect(
          createTagUsecase.execute({
            input: { name: `${testPrefix}Existing Tag` },
            session: adminSession,
          }),
        ).rejects.toThrow();
      });
    });

    describe('Comment Usecases', () => {
      it('should create, update status and delete comment', async () => {
        const article = await articleRepository.create({
          title: `${testPrefix}Comment Usecase Article`,
          content: 'Content',
          summary: 'Comment usecase test',
          authorId: 'test-author-id',
          status: ArticleStatus.PUBLISHED,
          viewCount: 0,
          likeCount: 0,
          isPinned: false,
          publishedAt: new Date(),
        });
        seededArticleIds.push(article.id);

        const created = await createCommentUsecase.execute({
          input: {
            articleId: article.id,
            authorName: 'Usecase Author',
            authorEmail: 'usecase@example.com',
            content: 'Usecase comment',
          },
          session: userSession,
        });
        seededCommentIds.push(created.id);

        expect(created.id).toBeDefined();
        expect(created.status).toBe(CommentStatus.PENDING);

        const approved = await updateCommentStatusUsecase.execute({
          id: created.id,
          status: CommentStatus.APPROVED,
          session: adminSession,
        });
        expect(approved.status).toBe(CommentStatus.APPROVED);

        await deleteCommentUsecase.execute({ id: created.id, session: adminSession });

        const deleted = await commentRepository.findById(created.id);
        expect(deleted).toBeNull();
      });

      it('should generate avatar from email MD5', async () => {
        const article = await articleRepository.create({
          title: `${testPrefix}Avatar Test Article`,
          content: 'Content',
          summary: 'Avatar test',
          authorId: 'test-author-id',
          status: ArticleStatus.PUBLISHED,
          viewCount: 0,
          likeCount: 0,
          isPinned: false,
          publishedAt: new Date(),
        });
        seededArticleIds.push(article.id);

        const created = await createCommentUsecase.execute({
          input: {
            articleId: article.id,
            authorName: 'Avatar Test Author',
            authorEmail: 'avatar@example.com',
            content: 'Avatar test comment',
          },
          session: userSession,
        });
        seededCommentIds.push(created.id);

        expect(created.authorAvatar).toBeDefined();
        expect(created.authorAvatar).toContain('gravatar.com/avatar/');
        expect(created.authorAvatar).toContain('d=identicon');
        expect(created.authorAvatar).toContain('7671d949664fc1fbce03b4ee41c509a4');
      });

      it('should cascade delete child comments', async () => {
        const article = await articleRepository.create({
          title: `${testPrefix}Cascade Delete Article`,
          content: 'Content',
          summary: 'Cascade delete test',
          authorId: 'test-author-id',
          status: ArticleStatus.PUBLISHED,
          viewCount: 0,
          likeCount: 0,
          isPinned: false,
          publishedAt: new Date(),
        });
        seededArticleIds.push(article.id);

        const parentComment = await commentRepository.create({
          articleId: article.id,
          authorName: 'Parent Author',
          authorEmail: 'parent@example.com',
          authorAvatar: '',
          content: 'Parent comment',
          status: CommentStatus.APPROVED,
          parentId: null,
        });
        seededCommentIds.push(parentComment.id);

        const childComment = await commentRepository.create({
          articleId: article.id,
          authorName: 'Child Author',
          authorEmail: 'child@example.com',
          authorAvatar: '',
          content: 'Child comment',
          status: CommentStatus.APPROVED,
          parentId: parentComment.id,
        });
        seededCommentIds.push(childComment.id);

        const grandchildComment = await commentRepository.create({
          articleId: article.id,
          authorName: 'Grandchild Author',
          authorEmail: 'grandchild@example.com',
          authorAvatar: '',
          content: 'Grandchild comment',
          status: CommentStatus.APPROVED,
          parentId: childComment.id,
        });
        seededCommentIds.push(grandchildComment.id);

        await deleteCommentUsecase.execute({ id: parentComment.id, session: adminSession });

        const deletedParent = await commentRepository.findById(parentComment.id);
        const deletedChild = await commentRepository.findById(childComment.id);
        const deletedGrandchild = await commentRepository.findById(grandchildComment.id);

        expect(deletedParent).toBeNull();
        expect(deletedChild).toBeNull();
        expect(deletedGrandchild).toBeNull();
      });

      it('should approve comment using ApproveCommentUsecase', async () => {
        const article = await articleRepository.create({
          title: `${testPrefix}Approve Usecase Article`,
          content: 'Content',
          summary: 'Approve usecase test',
          authorId: 'test-author-id',
          status: ArticleStatus.PUBLISHED,
          viewCount: 0,
          likeCount: 0,
          isPinned: false,
          publishedAt: new Date(),
        });
        seededArticleIds.push(article.id);

        const comment = await commentRepository.create({
          articleId: article.id,
          authorName: 'Approve Test Author',
          authorEmail: 'approve@example.com',
          authorAvatar: '',
          content: 'Approve test comment',
          status: CommentStatus.PENDING,
          parentId: null,
        });
        seededCommentIds.push(comment.id);

        const approved = await approveCommentUsecase.execute({
          id: comment.id,
          session: adminSession,
        });

        expect(approved.status).toBe(CommentStatus.APPROVED);

        const found = await commentRepository.findById(comment.id);
        expect(found?.status).toBe(CommentStatus.APPROVED);
      });

      it('should reject comment using RejectCommentUsecase', async () => {
        const article = await articleRepository.create({
          title: `${testPrefix}Reject Usecase Article`,
          content: 'Content',
          summary: 'Reject usecase test',
          authorId: 'test-author-id',
          status: ArticleStatus.PUBLISHED,
          viewCount: 0,
          likeCount: 0,
          isPinned: false,
          publishedAt: new Date(),
        });
        seededArticleIds.push(article.id);

        const comment = await commentRepository.create({
          articleId: article.id,
          authorName: 'Reject Test Author',
          authorEmail: 'reject@example.com',
          authorAvatar: '',
          content: 'Reject test comment',
          status: CommentStatus.PENDING,
          parentId: null,
        });
        seededCommentIds.push(comment.id);

        const rejected = await rejectCommentUsecase.execute({
          id: comment.id,
          session: adminSession,
        });

        expect(rejected.status).toBe(CommentStatus.REJECTED);

        const found = await commentRepository.findById(comment.id);
        expect(found?.status).toBe(CommentStatus.REJECTED);
      });
    });
  });

  describe('Blog GraphQL Resolvers', () => {
    it('should query articles via GraphQL', async () => {
      const article = await articleRepository.create({
        title: `${testPrefix}GraphQL Query Article`,
        content: '# GraphQL Query Test',
        summary: 'GraphQL query test',
        authorId: 'test-author-id',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: new Date(),
      });
      seededArticleIds.push(article.id);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              articles(pagination: {page: 1, limit: 10}) {
                items { id title status }
                total
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.articles.total).toBeGreaterThanOrEqual(1);
      expect(response.body.data.articles.items).toBeDefined();
    });

    it('should query single article via GraphQL', async () => {
      const article = await articleRepository.create({
        title: `${testPrefix}GraphQL Single Article`,
        content: '# GraphQL Single Test',
        summary: 'GraphQL single test',
        authorId: 'test-author-id',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: new Date(),
      });
      seededArticleIds.push(article.id);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              article(id: "${article.id}") {
                id
                title
                summary
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.article.id).toBe(article.id);
      expect(response.body.data.article.title).toBe(`${testPrefix}GraphQL Single Article`);
    });

    it('should query categories via GraphQL', async () => {
      const category = await categoryRepository.create({
        name: `${testPrefix}GraphQL Category`,
        slug: `${testPrefix}graphql-category`,
        sort: 0,
        parentId: null,
      });
      seededCategoryIds.push(category.id);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              categories {
                id
                name
                slug
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.categories)).toBe(true);
      expect(response.body.data.categories.length).toBeGreaterThanOrEqual(1);
    });

    it('should query tags via GraphQL', async () => {
      const tag = await tagRepository.create({
        name: `${testPrefix}GraphQL Tag`,
        slug: `${testPrefix}graphql-tag`,
      });
      seededTagIds.push(tag.id);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              tags {
                id
                name
                slug
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.tags)).toBe(true);
      expect(response.body.data.tags.length).toBeGreaterThanOrEqual(1);
    });

    it('should query archives via GraphQL', async () => {
      await Promise.all(
        Array.from({ length: 2 }).map((_, i) =>
          articleRepository.create({
            title: `${testPrefix}GraphQL Archive ${i}`,
            content: 'Content',
            summary: `Archive ${i}`,
            authorId: 'test-author-id',
            status: ArticleStatus.PUBLISHED,
            viewCount: 0,
            likeCount: 0,
            isPinned: false,
            publishedAt: new Date(),
          }),
        ),
      ).then((articles) => seededArticleIds.push(...articles.map((a) => a.id)));

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              archives {
                year
                month
                count
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.archives)).toBe(true);
      expect(response.body.data.archives.length).toBeGreaterThanOrEqual(1);
    });

    it('should create article via GraphQL mutation', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createArticle(input: {
                title: "${testPrefix}GraphQL Mutation Article"
                content: "# GraphQL Mutation Test"
                summary: "GraphQL mutation test"
              }) {
                id
                title
                status
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.createArticle.id).toBeDefined();
      expect(response.body.data.createArticle.title).toBe(`${testPrefix}GraphQL Mutation Article`);
      expect(response.body.data.createArticle.status).toBe('DRAFT');

      seededArticleIds.push(response.body.data.createArticle.id);
    });

    it('should increment view count via GraphQL mutation', async () => {
      const article = await articleRepository.create({
        title: `${testPrefix}GraphQL View Count`,
        content: '# View Count Test',
        summary: 'View count test',
        authorId: 'test-author-id',
        status: ArticleStatus.PUBLISHED,
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: new Date(),
      });
      seededArticleIds.push(article.id);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              incrementViewCount(id: "${article.id}") {
                id
                viewCount
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.incrementViewCount.viewCount).toBe(1);

      const found = await articleRepository.findById(article.id);
      expect(found?.viewCount).toBe(1);
    });
  });

  async function cleanupSeededData(): Promise<void> {
    if (seededCommentIds.length > 0) {
      await dataSource.getRepository(CommentEntity).delete({ id: In(seededCommentIds) });
      seededCommentIds = [];
    }

    if (seededArticleIds.length > 0) {
      await dataSource.getRepository(ArticleTagEntity).delete({ articleId: In(seededArticleIds) });
      await dataSource.getRepository(ArticleEntity).delete({ id: In(seededArticleIds) });
      seededArticleIds = [];
    }

    if (seededCategoryIds.length > 0) {
      await dataSource.getRepository(CategoryEntity).delete({ id: In(seededCategoryIds) });
      seededCategoryIds = [];
    }

    if (seededTagIds.length > 0) {
      await dataSource.getRepository(TagEntity).delete({ id: In(seededTagIds) });
      seededTagIds = [];
    }

    await dataSource.getRepository(CommentEntity).delete({ authorEmail: Like(`${testPrefix}%`) });
    await dataSource.getRepository(ArticleEntity).delete({ title: Like(`${testPrefix}%`) });
    await dataSource.getRepository(CategoryEntity).delete({ name: Like(`${testPrefix}%`) });
    await dataSource.getRepository(CategoryEntity).delete({ slug: Like(`${testPrefix}%`) });
    await dataSource.getRepository(TagEntity).delete({ name: Like(`${testPrefix}%`) });
    await dataSource.getRepository(TagEntity).delete({ slug: Like(`${testPrefix}%`) });
  }
});
