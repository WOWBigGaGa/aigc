import { initGraphQLSchema } from '../../schema/schema.init';
import { ArticleStatus, CommentStatus } from '@src/modules/blog/blog.types';

describe('Blog GraphQL Schema Registration', () => {
  describe('Enum Registration', () => {
    it('should include ArticleStatus and CommentStatus in enum registry', () => {
      const result = initGraphQLSchema();

      expect(result.success).toBe(true);
      expect(result.enums).toContain('ArticleStatus');
      expect(result.enums).toContain('CommentStatus');
    });

    it('should have correct ArticleStatus enum values', () => {
      expect(ArticleStatus.DRAFT).toBe('DRAFT');
      expect(ArticleStatus.PUBLISHED).toBe('PUBLISHED');
      expect(ArticleStatus.ARCHIVED).toBe('ARCHIVED');
    });

    it('should have correct CommentStatus enum values', () => {
      expect(CommentStatus.PENDING).toBe('PENDING');
      expect(CommentStatus.APPROVED).toBe('APPROVED');
      expect(CommentStatus.REJECTED).toBe('REJECTED');
    });
  });

  describe('Schema Fingerprint', () => {
    it('should generate consistent fingerprint after successful registration', () => {
      const result = initGraphQLSchema();

      if (result.success) {
        expect(result.fingerprint).toBeDefined();
        expect(result.fingerprint).toHaveLength(8);
      } else {
        expect(result.message).toBe('Schema 已初始化，重复调用已忽略');
      }
    });
  });
});
