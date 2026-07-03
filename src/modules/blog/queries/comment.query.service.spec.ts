import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentEntity } from '../entities/comment.entity';
import { CommentRepository } from '../repositories/comment.repository';
import { CommentQueryService } from './comment.query.service';
import { CommentStatus, PaginationInput } from '../blog.types';

describe('CommentQueryService', () => {
  let service: CommentQueryService;
  let commentRepository: any;

  const mockCommentEntity = {
    id: 'comment-1',
    articleId: 'article-1',
    authorName: 'John Doe',
    authorEmail: 'john@example.com',
    authorAvatar: '',
    content: 'Great article!',
    status: CommentStatus.APPROVED,
    parentId: null,
    createdAt: new Date('2026-06-15'),
    updatedAt: new Date('2026-06-15'),
    deletedAt: null,
  } as CommentEntity;

  const mockReplyEntity = {
    id: 'comment-2',
    articleId: 'article-1',
    authorName: 'Jane Smith',
    authorEmail: 'jane@example.com',
    authorAvatar: '',
    content: 'Reply to comment',
    status: CommentStatus.APPROVED,
    parentId: 'comment-1',
    createdAt: new Date('2026-06-15'),
    updatedAt: new Date('2026-06-15'),
    deletedAt: null,
  } as CommentEntity;

  beforeEach(async () => {
    commentRepository = {
      findApprovedByArticle: jest.fn(),
      findPendingComments: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentQueryService, { provide: CommentRepository, useValue: commentRepository }],
    }).compile();

    service = module.get<CommentQueryService>(CommentQueryService);
  });

  describe('getCommentsByArticle', () => {
    const pagination: PaginationInput = { page: 1, limit: 10 };

    it('should return flat comments when no nesting', async () => {
      commentRepository.findApprovedByArticle.mockResolvedValue({
        items: [mockCommentEntity],
        total: 1,
      });

      const result = await service.getCommentsByArticle('article-1', pagination);

      expect(result).toEqual({
        items: [
          {
            id: 'comment-1',
            articleId: 'article-1',
            authorName: 'John Doe',
            authorEmail: 'john@example.com',
            authorAvatar: '',
            content: 'Great article!',
            status: CommentStatus.APPROVED,
            parentId: null,
            createdAt: new Date('2026-06-15'),
            updatedAt: new Date('2026-06-15'),
            children: [],
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        pageInfo: {
          hasNext: false,
        },
      });
    });

    it('should build nested comment tree (楼中楼)', async () => {
      commentRepository.findApprovedByArticle.mockResolvedValue({
        items: [mockCommentEntity, mockReplyEntity],
        total: 2,
      });

      const result = await service.getCommentsByArticle('article-1', pagination);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].children).toHaveLength(1);
      expect(result.items[0].id).toBe('comment-1');
      expect(result.items[0].children[0].id).toBe('comment-2');
      expect(result.items[0].children[0].parentId).toBe('comment-1');
    });

    it('should handle orphaned reply (parent not in current page)', async () => {
      commentRepository.findApprovedByArticle.mockResolvedValue({
        items: [mockReplyEntity],
        total: 1,
      });

      const result = await service.getCommentsByArticle('article-1', pagination);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('comment-2');
    });

    it('should throw DomainError when repository throws', async () => {
      commentRepository.findApprovedByArticle.mockRejectedValue(
        new DomainError(BLOG_ERROR.QUERY_FAILED, 'Query failed'),
      );

      await expect(service.getCommentsByArticle('article-1', pagination)).rejects.toThrow(
        DomainError,
      );
    });

    it('should throw DomainError when unknown error occurs', async () => {
      commentRepository.findApprovedByArticle.mockRejectedValue(new Error('Unknown error'));

      await expect(service.getCommentsByArticle('article-1', pagination)).rejects.toThrow(
        DomainError,
      );
    });
  });

  describe('getPendingComments', () => {
    const pagination: PaginationInput = { page: 1, limit: 10 };

    it('should return pending comments', async () => {
      const pendingComment = { ...mockCommentEntity, status: CommentStatus.PENDING };
      commentRepository.findPendingComments.mockResolvedValue({
        items: [pendingComment],
        total: 1,
      });

      const result = await service.getPendingComments(pagination);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe(CommentStatus.PENDING);
    });

    it('should throw DomainError when repository throws', async () => {
      commentRepository.findPendingComments.mockRejectedValue(
        new DomainError(BLOG_ERROR.QUERY_FAILED, 'Query failed'),
      );

      await expect(service.getPendingComments(pagination)).rejects.toThrow(DomainError);
    });
  });

  describe('getCommentById', () => {
    it('should return comment view when found', async () => {
      commentRepository.findById.mockResolvedValue(mockCommentEntity);

      const result = await service.getCommentById('comment-1');

      expect(result).toEqual({
        id: 'comment-1',
        articleId: 'article-1',
        authorName: 'John Doe',
        authorEmail: 'john@example.com',
        authorAvatar: '',
        content: 'Great article!',
        status: CommentStatus.APPROVED,
        parentId: null,
        createdAt: new Date('2026-06-15'),
        updatedAt: new Date('2026-06-15'),
      });
    });

    it('should return null when comment not found', async () => {
      commentRepository.findById.mockResolvedValue(null);

      const result = await service.getCommentById('comment-1');

      expect(result).toBeNull();
    });

    it('should throw DomainError when repository throws', async () => {
      commentRepository.findById.mockRejectedValue(
        new DomainError(BLOG_ERROR.QUERY_FAILED, 'Query failed'),
      );

      await expect(service.getCommentById('comment-1')).rejects.toThrow(DomainError);
    });
  });
});
