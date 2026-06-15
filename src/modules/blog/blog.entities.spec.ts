import { ArticleEntity } from './entities/article.entity';
import { CategoryEntity } from './entities/category.entity';
import { TagEntity } from './entities/tag.entity';
import { CommentEntity } from './entities/comment.entity';
import { UserEntity } from './entities/user.entity';
import { FriendLinkEntity } from './entities/friend-link.entity';
import { FileEntity } from './entities/file.entity';
import { ArticleStatus, CommentStatus } from './blog.types';

describe('Blog Entities', () => {
  describe('ArticleEntity', () => {
    it('should set and get article fields correctly', () => {
      const article = new ArticleEntity();
      article.id = 'article-id';
      article.title = 'Test Article';
      article.content = '# Hello World';
      article.summary = 'A test article';
      article.authorId = 'test-author-id';
      article.status = ArticleStatus.DRAFT;
      article.viewCount = 0;
      article.likeCount = 0;
      article.isPinned = false;
      article.coverImage = null;
      article.categoryId = null;
      article.publishedAt = null;
      article.deletedAt = null;

      expect(article.id).toBe('article-id');
      expect(article.title).toBe('Test Article');
      expect(article.content).toBe('# Hello World');
      expect(article.summary).toBe('A test article');
      expect(article.authorId).toBe('test-author-id');
      expect(article.viewCount).toBe(0);
      expect(article.likeCount).toBe(0);
      expect(article.isPinned).toBe(false);
      expect(article.status).toBe(ArticleStatus.DRAFT);
      expect(article.coverImage).toBeNull();
      expect(article.categoryId).toBeNull();
      expect(article.publishedAt).toBeNull();
      expect(article.deletedAt).toBeNull();
    });

    it('should support published status', () => {
      const article = new ArticleEntity();
      article.id = 'article-id';
      article.title = 'Published Article';
      article.content = 'Published content';
      article.coverImage = 'http://example.com/cover.jpg';
      article.summary = 'A published article';
      article.status = ArticleStatus.PUBLISHED;
      article.authorId = 'test-author-id';
      article.viewCount = 100;
      article.likeCount = 10;
      article.isPinned = true;
      article.publishedAt = new Date('2026-06-15');

      expect(article.status).toBe(ArticleStatus.PUBLISHED);
      expect(article.isPinned).toBe(true);
      expect(article.viewCount).toBe(100);
      expect(article.likeCount).toBe(10);
      expect(article.coverImage).toBe('http://example.com/cover.jpg');
      expect(article.publishedAt).toEqual(new Date('2026-06-15'));
    });

    it('should support archived status', () => {
      const article = new ArticleEntity();
      article.id = 'article-id';
      article.title = 'Archived Article';
      article.content = 'Archived content';
      article.summary = 'An archived article';
      article.status = ArticleStatus.ARCHIVED;
      article.authorId = 'test-author-id';

      expect(article.status).toBe(ArticleStatus.ARCHIVED);
    });
  });

  describe('CategoryEntity', () => {
    it('should set and get category fields correctly', () => {
      const category = new CategoryEntity();
      category.id = 'category-id';
      category.name = 'Technology';
      category.slug = 'technology';
      category.description = 'Tech articles';
      category.sort = 0;
      category.parentId = null;

      expect(category.id).toBe('category-id');
      expect(category.name).toBe('Technology');
      expect(category.slug).toBe('technology');
      expect(category.description).toBe('Tech articles');
      expect(category.sort).toBe(0);
      expect(category.parentId).toBeNull();
    });

    it('should support nested categories', () => {
      const parent = new CategoryEntity();
      parent.id = 'parent-id';
      parent.name = 'Parent';
      parent.slug = 'parent';

      const child = new CategoryEntity();
      child.id = 'child-id';
      child.name = 'Child';
      child.slug = 'child';
      child.parentId = parent.id;
      child.sort = 1;

      expect(child.parentId).toBe('parent-id');
      expect(child.sort).toBe(1);
    });
  });

  describe('TagEntity', () => {
    it('should set and get tag fields correctly', () => {
      const tag = new TagEntity();
      tag.id = 'tag-id';
      tag.name = 'JavaScript';
      tag.slug = 'javascript';

      expect(tag.id).toBe('tag-id');
      expect(tag.name).toBe('JavaScript');
      expect(tag.slug).toBe('javascript');
    });
  });

  describe('CommentEntity', () => {
    it('should set and get comment fields correctly', () => {
      const comment = new CommentEntity();
      comment.id = 'comment-id';
      comment.articleId = 'test-article-id';
      comment.authorName = 'John Doe';
      comment.authorEmail = 'john@example.com';
      comment.authorAvatar = 'http://example.com/avatar.jpg';
      comment.content = 'Great article!';
      comment.status = CommentStatus.PENDING;
      comment.parentId = null;

      expect(comment.id).toBe('comment-id');
      expect(comment.articleId).toBe('test-article-id');
      expect(comment.authorName).toBe('John Doe');
      expect(comment.authorEmail).toBe('john@example.com');
      expect(comment.authorAvatar).toBe('http://example.com/avatar.jpg');
      expect(comment.content).toBe('Great article!');
      expect(comment.status).toBe(CommentStatus.PENDING);
      expect(comment.parentId).toBeNull();
    });

    it('should support nested comments (reply)', () => {
      const parentComment = new CommentEntity();
      parentComment.id = 'parent-id';
      parentComment.articleId = 'test-article-id';
      parentComment.authorName = 'Parent';
      parentComment.authorEmail = 'parent@example.com';
      parentComment.authorAvatar = 'avatar.jpg';
      parentComment.content = 'Parent comment';

      const reply = new CommentEntity();
      reply.id = 'reply-id';
      reply.articleId = 'test-article-id';
      reply.authorName = 'Reply';
      reply.authorEmail = 'reply@example.com';
      reply.authorAvatar = 'avatar.jpg';
      reply.content = 'Reply comment';
      reply.parentId = parentComment.id;

      expect(reply.parentId).toBe('parent-id');
    });

    it('should support approved status', () => {
      const comment = new CommentEntity();
      comment.id = 'comment-id';
      comment.articleId = 'test-article-id';
      comment.authorName = 'Test';
      comment.authorEmail = 'test@example.com';
      comment.authorAvatar = 'avatar.jpg';
      comment.content = 'Comment';
      comment.status = CommentStatus.APPROVED;

      expect(comment.status).toBe(CommentStatus.APPROVED);
    });

    it('should support rejected status', () => {
      const comment = new CommentEntity();
      comment.id = 'comment-id';
      comment.articleId = 'test-article-id';
      comment.authorName = 'Test';
      comment.authorEmail = 'test@example.com';
      comment.authorAvatar = 'avatar.jpg';
      comment.content = 'Comment';
      comment.status = CommentStatus.REJECTED;

      expect(comment.status).toBe(CommentStatus.REJECTED);
    });
  });

  describe('UserEntity', () => {
    it('should set and get user fields correctly', () => {
      const user = new UserEntity();
      user.id = 'user-id';
      user.username = 'testuser';
      user.passwordHash = 'hashed-password';
      user.nickname = 'Test User';
      user.email = 'test@example.com';
      user.avatar = null;
      user.bio = null;

      expect(user.id).toBe('user-id');
      expect(user.username).toBe('testuser');
      expect(user.passwordHash).toBe('hashed-password');
      expect(user.nickname).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.avatar).toBeNull();
      expect(user.bio).toBeNull();
    });
  });

  describe('FriendLinkEntity', () => {
    it('should set and get friend link fields correctly', () => {
      const link = new FriendLinkEntity();
      link.id = 'link-id';
      link.name = 'Example Site';
      link.url = 'http://example.com';
      link.description = 'An example site';
      link.isActive = true;
      link.sort = 1;

      expect(link.id).toBe('link-id');
      expect(link.name).toBe('Example Site');
      expect(link.url).toBe('http://example.com');
      expect(link.description).toBe('An example site');
      expect(link.isActive).toBe(true);
      expect(link.sort).toBe(1);
    });

    it('should support inactive status', () => {
      const link = new FriendLinkEntity();
      link.id = 'link-id';
      link.name = 'Deactivated';
      link.url = 'http://deactivated.com';
      link.isActive = false;

      expect(link.isActive).toBe(false);
    });
  });

  describe('FileEntity', () => {
    it('should set and get file fields correctly', () => {
      const file = new FileEntity();
      file.id = 'file-id';
      file.originalName = 'test.jpg';
      file.storedName = 'abc123.jpg';
      file.path = '/uploads/abc123.jpg';
      file.url = 'http://example.com/uploads/abc123.jpg';
      file.mimeType = 'image/jpeg';
      file.size = 1024;
      file.uploadedBy = 'test-user-id';

      expect(file.id).toBe('file-id');
      expect(file.originalName).toBe('test.jpg');
      expect(file.storedName).toBe('abc123.jpg');
      expect(file.path).toBe('/uploads/abc123.jpg');
      expect(file.url).toBe('http://example.com/uploads/abc123.jpg');
      expect(file.mimeType).toBe('image/jpeg');
      expect(file.size).toBe(1024);
      expect(file.uploadedBy).toBe('test-user-id');
    });
  });
});
