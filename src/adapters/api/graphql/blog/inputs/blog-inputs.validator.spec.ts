import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateArticleInput } from './create-article.input';
import { UpdateArticleInput } from './update-article.input';
import { CreateCategoryInput } from './create-category.input';
import { UpdateCategoryInput } from './update-category.input';
import { CreateTagInput } from './create-tag.input';
import { UpdateTagInput } from './update-tag.input';
import { CreateCommentInput } from './create-comment.input';
import { ArticleFilterInput } from './article-filter.input';
import { PaginationInput } from './pagination.input';
import { ArticleStatus } from '@src/modules/blog/blog.types';

describe('Blog GraphQL Input Validators', () => {
  describe('CreateArticleInput', () => {
    it('should validate valid input', async () => {
      const input = plainToInstance(CreateArticleInput, {
        title: 'Test Article',
        content: '# Hello World\n\nThis is content',
        summary: 'A test summary',
      });

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });

    it('should reject missing required fields', async () => {
      const input = plainToInstance(CreateArticleInput, {
        content: '# Hello World',
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const missingTitle = errors.find((e) => e.property === 'title');
      expect(missingTitle).toBeDefined();
    });

    it('should reject title exceeding max length', async () => {
      const input = plainToInstance(CreateArticleInput, {
        title: 'a'.repeat(201),
        content: 'Content',
        summary: 'Summary',
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
    });

    it('should reject summary exceeding max length', async () => {
      const input = plainToInstance(CreateArticleInput, {
        title: 'Test',
        content: 'Content',
        summary: 'a'.repeat(501),
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const summaryError = errors.find((e) => e.property === 'summary');
      expect(summaryError).toBeDefined();
    });
  });

  describe('UpdateArticleInput', () => {
    it('should validate valid partial input', async () => {
      const input = plainToInstance(UpdateArticleInput, {
        title: 'Updated Title',
      });

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });

    it('should validate empty input', async () => {
      const input = plainToInstance(UpdateArticleInput, {});

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid status enum', async () => {
      const input = plainToInstance(UpdateArticleInput, {
        status: 'INVALID_STATUS',
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const statusError = errors.find((e) => e.property === 'status');
      expect(statusError).toBeDefined();
    });

    it('should validate valid status enum', async () => {
      const input = plainToInstance(UpdateArticleInput, {
        status: ArticleStatus.PUBLISHED,
      });

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });
  });

  describe('CreateCategoryInput', () => {
    it('should validate valid input', async () => {
      const input = plainToInstance(CreateCategoryInput, {
        name: 'Test Category',
        slug: 'test-category',
        description: 'A test category',
      });

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });

    it('should reject missing name', async () => {
      const input = plainToInstance(CreateCategoryInput, {
        slug: 'test-category',
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const nameError = errors.find((e) => e.property === 'name');
      expect(nameError).toBeDefined();
    });

    it('should reject name exceeding max length', async () => {
      const input = plainToInstance(CreateCategoryInput, {
        name: 'a'.repeat(101),
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const nameError = errors.find((e) => e.property === 'name');
      expect(nameError).toBeDefined();
    });
  });

  describe('UpdateCategoryInput', () => {
    it('should validate empty input', async () => {
      const input = plainToInstance(UpdateCategoryInput, {});

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });

    it('should validate partial input', async () => {
      const input = plainToInstance(UpdateCategoryInput, {
        name: 'Updated Category',
      });

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });
  });

  describe('CreateTagInput', () => {
    it('should validate valid input', async () => {
      const input = plainToInstance(CreateTagInput, {
        name: 'Test Tag',
        slug: 'test-tag',
      });

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });

    it('should reject missing name', async () => {
      const input = plainToInstance(CreateTagInput, {});

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const nameError = errors.find((e) => e.property === 'name');
      expect(nameError).toBeDefined();
    });

    it('should reject name exceeding max length', async () => {
      const input = plainToInstance(CreateTagInput, {
        name: 'a'.repeat(51),
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const nameError = errors.find((e) => e.property === 'name');
      expect(nameError).toBeDefined();
    });
  });

  describe('UpdateTagInput', () => {
    it('should validate empty input', async () => {
      const input = plainToInstance(UpdateTagInput, {});

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });
  });

  describe('CreateCommentInput', () => {
    it('should validate valid input', async () => {
      const input = plainToInstance(CreateCommentInput, {
        articleId: 'article-1',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        content: 'Great article!',
      });

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });

    it('should reject missing required fields', async () => {
      const input = plainToInstance(CreateCommentInput, {
        authorName: 'Test',
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.find((e) => e.property === 'articleId')).toBeDefined();
      expect(errors.find((e) => e.property === 'authorEmail')).toBeDefined();
      expect(errors.find((e) => e.property === 'content')).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const input = plainToInstance(CreateCommentInput, {
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'invalid-email',
        content: 'Comment',
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const emailError = errors.find((e) => e.property === 'authorEmail');
      expect(emailError).toBeDefined();
    });

    it('should reject content exceeding max length', async () => {
      const input = plainToInstance(CreateCommentInput, {
        articleId: 'article-1',
        authorName: 'Test',
        authorEmail: 'test@example.com',
        content: 'a'.repeat(2001),
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const contentError = errors.find((e) => e.property === 'content');
      expect(contentError).toBeDefined();
    });
  });

  describe('ArticleFilterInput', () => {
    it('should validate empty input', async () => {
      const input = plainToInstance(ArticleFilterInput, {});

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });

    it('should validate valid status', async () => {
      const input = plainToInstance(ArticleFilterInput, {
        status: ArticleStatus.PUBLISHED,
      });

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid status', async () => {
      const input = plainToInstance(ArticleFilterInput, {
        status: 'INVALID',
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const statusError = errors.find((e) => e.property === 'status');
      expect(statusError).toBeDefined();
    });
  });

  describe('PaginationInput', () => {
    it('should validate default values', async () => {
      const input = plainToInstance(PaginationInput, {
        page: 1,
        limit: 10,
      });

      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    });

    it('should reject page less than 1', async () => {
      const input = plainToInstance(PaginationInput, {
        page: 0,
        limit: 10,
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find((e) => e.property === 'page');
      expect(pageError).toBeDefined();
    });

    it('should reject limit less than 1', async () => {
      const input = plainToInstance(PaginationInput, {
        page: 1,
        limit: 0,
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
    });

    it('should reject limit greater than 100', async () => {
      const input = plainToInstance(PaginationInput, {
        page: 1,
        limit: 101,
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
    });

    it('should reject non-integer page', async () => {
      const input = plainToInstance(PaginationInput, {
        page: 'abc',
        limit: 10,
      });

      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find((e) => e.property === 'page');
      expect(pageError).toBeDefined();
    });
  });
});
