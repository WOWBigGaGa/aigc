import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from './entities/article.entity';
import { CategoryEntity } from './entities/category.entity';
import { TagEntity } from './entities/tag.entity';
import { CommentEntity } from './entities/comment.entity';
import { UserEntity } from './entities/user.entity';
import { FriendLinkEntity } from './entities/friend-link.entity';
import { FileEntity } from './entities/file.entity';
import { ArticleStatus, CommentStatus } from './blog.types';

describe('Blog Entities', () => {
  let articleRepository: Repository<ArticleEntity>;
  let categoryRepository: Repository<CategoryEntity>;
  let tagRepository: Repository<TagEntity>;
  let commentRepository: Repository<CommentEntity>;
  let userRepository: Repository<UserEntity>;
  let friendLinkRepository: Repository<FriendLinkEntity>;
  let fileRepository: Repository<FileEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [
            ArticleEntity,
            CategoryEntity,
            TagEntity,
            CommentEntity,
            UserEntity,
            FriendLinkEntity,
            FileEntity,
          ],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([
          ArticleEntity,
          CategoryEntity,
          TagEntity,
          CommentEntity,
          UserEntity,
          FriendLinkEntity,
          FileEntity,
        ]),
      ],
    }).compile();

    articleRepository = module.get<Repository<ArticleEntity>>(getRepositoryToken(ArticleEntity));
    categoryRepository = module.get<Repository<CategoryEntity>>(getRepositoryToken(CategoryEntity));
    tagRepository = module.get<Repository<TagEntity>>(getRepositoryToken(TagEntity));
    commentRepository = module.get<Repository<CommentEntity>>(getRepositoryToken(CommentEntity));
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    friendLinkRepository = module.get<Repository<FriendLinkEntity>>(
      getRepositoryToken(FriendLinkEntity),
    );
    fileRepository = module.get<Repository<FileEntity>>(getRepositoryToken(FileEntity));
  });

  describe('ArticleEntity', () => {
    it('should create an article with default status DRAFT', async () => {
      const article = articleRepository.create({
        title: 'Test Article',
        content: '# Hello World',
        summary: 'A test article',
        authorId: 'test-author-id',
      });

      const savedArticle = await articleRepository.save(article);

      expect(savedArticle.id).toBeDefined();
      expect(savedArticle.title).toBe('Test Article');
      expect(savedArticle.status).toBe(ArticleStatus.DRAFT);
      expect(savedArticle.viewCount).toBe(0);
      expect(savedArticle.likeCount).toBe(0);
      expect(savedArticle.isPinned).toBe(false);
      expect(savedArticle.createdAt).toBeDefined();
    });

    it('should create a published article with custom fields', async () => {
      const article = articleRepository.create({
        title: 'Published Article',
        content: 'Published content',
        coverImage: 'http://example.com/cover.jpg',
        summary: 'A published article',
        status: ArticleStatus.PUBLISHED,
        authorId: 'test-author-id',
        viewCount: 100,
        likeCount: 10,
        isPinned: true,
        publishedAt: new Date(),
      });

      const savedArticle = await articleRepository.save(article);

      expect(savedArticle.status).toBe(ArticleStatus.PUBLISHED);
      expect(savedArticle.isPinned).toBe(true);
      expect(savedArticle.viewCount).toBe(100);
      expect(savedArticle.likeCount).toBe(10);
      expect(savedArticle.coverImage).toBe('http://example.com/cover.jpg');
    });

    it('should support soft delete', async () => {
      const article = articleRepository.create({
        title: 'Soft Delete Test',
        content: 'Content',
        summary: 'Test',
        authorId: 'test-author-id',
      });
      const savedArticle = await articleRepository.save(article);

      await articleRepository.softDelete({ id: savedArticle.id });
      const deletedArticle = await articleRepository.findOneBy({ id: savedArticle.id });

      expect(deletedArticle).toBeNull();

      const withDeleted = await articleRepository.findOne({
        where: { id: savedArticle.id },
        withDeleted: true,
      });
      expect(withDeleted?.deletedAt).toBeDefined();
    });
  });

  describe('CategoryEntity', () => {
    it('should create a category', async () => {
      const category = categoryRepository.create({
        name: 'Technology',
        slug: 'technology',
        description: 'Tech articles',
      });

      const savedCategory = await categoryRepository.save(category);

      expect(savedCategory.id).toBeDefined();
      expect(savedCategory.name).toBe('Technology');
      expect(savedCategory.slug).toBe('technology');
      expect(savedCategory.sort).toBe(0);
    });

    it('should create nested categories', async () => {
      const parent = categoryRepository.create({
        name: 'Parent',
        slug: 'parent',
      });
      const savedParent = await categoryRepository.save(parent);

      const child = categoryRepository.create({
        name: 'Child',
        slug: 'child',
        parentId: savedParent.id,
        sort: 1,
      });
      const savedChild = await categoryRepository.save(child);

      expect(savedChild.parentId).toBe(savedParent.id);
      expect(savedChild.sort).toBe(1);
    });
  });

  describe('TagEntity', () => {
    it('should create a tag', async () => {
      const tag = tagRepository.create({
        name: 'JavaScript',
        slug: 'javascript',
      });

      const savedTag = await tagRepository.save(tag);

      expect(savedTag.id).toBeDefined();
      expect(savedTag.name).toBe('JavaScript');
      expect(savedTag.slug).toBe('javascript');
    });
  });

  describe('CommentEntity', () => {
    it('should create a comment with default status PENDING', async () => {
      const comment = commentRepository.create({
        articleId: 'test-article-id',
        authorName: 'John Doe',
        authorEmail: 'john@example.com',
        authorAvatar: 'http://example.com/avatar.jpg',
        content: 'Great article!',
      });

      const savedComment = await commentRepository.save(comment);

      expect(savedComment.id).toBeDefined();
      expect(savedComment.status).toBe(CommentStatus.PENDING);
      expect(savedComment.parentId).toBeNull();
    });

    it('should create nested comments (reply)', async () => {
      const parentComment = commentRepository.create({
        articleId: 'test-article-id',
        authorName: 'Parent',
        authorEmail: 'parent@example.com',
        authorAvatar: 'avatar.jpg',
        content: 'Parent comment',
      });
      const savedParent = await commentRepository.save(parentComment);

      const reply = commentRepository.create({
        articleId: 'test-article-id',
        authorName: 'Reply',
        authorEmail: 'reply@example.com',
        authorAvatar: 'avatar.jpg',
        content: 'Reply comment',
        parentId: savedParent.id,
      });
      const savedReply = await commentRepository.save(reply);

      expect(savedReply.parentId).toBe(savedParent.id);
    });
  });

  describe('UserEntity', () => {
    it('should create a user', async () => {
      const user = userRepository.create({
        username: 'testuser',
        passwordHash: 'hashed-password',
        nickname: 'Test User',
        email: 'test@example.com',
      });

      const savedUser = await userRepository.save(user);

      expect(savedUser.id).toBeDefined();
      expect(savedUser.username).toBe('testuser');
      expect(savedUser.nickname).toBe('Test User');
      expect(savedUser.avatar).toBeNull();
    });
  });

  describe('FriendLinkEntity', () => {
    it('should create a friend link', async () => {
      const link = friendLinkRepository.create({
        name: 'Example Site',
        url: 'http://example.com',
        description: 'An example site',
        isActive: true,
        sort: 1,
      });

      const savedLink = await friendLinkRepository.save(link);

      expect(savedLink.id).toBeDefined();
      expect(savedLink.isActive).toBe(true);
      expect(savedLink.sort).toBe(1);
    });
  });

  describe('FileEntity', () => {
    it('should create a file record', async () => {
      const file = fileRepository.create({
        originalName: 'test.jpg',
        storedName: 'abc123.jpg',
        path: '/uploads/abc123.jpg',
        url: 'http://example.com/uploads/abc123.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        uploadedBy: 'test-user-id',
      });

      const savedFile = await fileRepository.save(file);

      expect(savedFile.id).toBeDefined();
      expect(savedFile.size).toBe(1024);
      expect(savedFile.mimeType).toBe('image/jpeg');
    });
  });
});
