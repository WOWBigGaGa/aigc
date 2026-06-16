import { DomainError } from '@core/common/errors/domain-error';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { CommentRepository } from './comment.repository';
import { CommentStatus } from '../blog.types';

describe('CommentRepository', () => {
  let repository: CommentRepository;
  let typeOrmRepository: any;

  const mockComment = {
    id: 'comment-id',
    articleId: 'article-1',
    authorName: 'John Doe',
    authorEmail: 'john@example.com',
    authorAvatar: '',
    content: 'Great article!',
    status: CommentStatus.APPROVED,
    parentId: null,
    deletedAt: null,
    createdAt: new Date('2026-06-15'),
    updatedAt: new Date('2026-06-15'),
  } as CommentEntity;

  beforeEach(async () => {
    typeOrmRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentRepository,
        {
          provide: getRepositoryToken(CommentEntity),
          useValue: typeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<CommentRepository>(CommentRepository);
  });

  describe('findApprovedByArticle', () => {
    it('should return approved comments for article', async () => {
      const expectedItems = [mockComment];
      const expectedTotal = 1;

      typeOrmRepository.findAndCount.mockResolvedValue([expectedItems, expectedTotal]);

      const result = await repository.findApprovedByArticle('article-1', 1, 10);

      expect(result).toEqual({ items: expectedItems, total: expectedTotal });
      expect(typeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where: { articleId: 'article-1', status: CommentStatus.APPROVED, deletedAt: IsNull() },
        order: { createdAt: 'ASC' },
        skip: 0,
        take: 10,
      });
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.findAndCount.mockRejectedValue(new Error('Database error'));

      await expect(repository.findApprovedByArticle('article-1', 1, 10)).rejects.toThrow(
        DomainError,
      );
    });
  });

  describe('findPendingComments', () => {
    it('should return pending comments', async () => {
      const pendingComment = { ...mockComment, status: CommentStatus.PENDING };
      typeOrmRepository.findAndCount.mockResolvedValue([[pendingComment], 1]);

      const result = await repository.findPendingComments(1, 10);

      expect(result).toEqual({ items: [pendingComment], total: 1 });
      expect(typeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where: { status: CommentStatus.PENDING, deletedAt: IsNull() },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.findAndCount.mockRejectedValue(new Error('Database error'));

      await expect(repository.findPendingComments(1, 10)).rejects.toThrow(DomainError);
    });
  });

  describe('findById', () => {
    it('should return comment when found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockComment);

      const result = await repository.findById('comment-id');

      expect(result).toEqual(mockComment);
    });

    it('should return null when comment not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('comment-id');

      expect(result).toBeNull();
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(repository.findById('comment-id')).rejects.toThrow(DomainError);
    });
  });

  describe('create', () => {
    it('should create and return comment', async () => {
      const commentData = {
        articleId: 'article-1',
        authorName: 'New Author',
        authorEmail: 'new@example.com',
        content: 'New comment',
      };
      typeOrmRepository.create.mockReturnValue({ ...commentData });
      typeOrmRepository.save.mockResolvedValue({ ...commentData, id: 'new-id' });

      const result = await repository.create(commentData);

      expect(result).toEqual({ ...commentData, id: 'new-id' });
    });

    it('should throw DomainError when creation fails', async () => {
      typeOrmRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(repository.create({ articleId: 'article-1', content: 'Test' })).rejects.toThrow(
        DomainError,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update comment status', async () => {
      const updatedComment = { ...mockComment, status: CommentStatus.APPROVED };
      typeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      typeOrmRepository.findOne.mockResolvedValue(updatedComment);

      const result = await repository.updateStatus('comment-id', CommentStatus.APPROVED);

      expect(result).toEqual(updatedComment);
      expect(typeOrmRepository.update).toHaveBeenCalledWith('comment-id', {
        status: CommentStatus.APPROVED,
      });
    });

    it('should throw DomainError when comment not found', async () => {
      typeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      typeOrmRepository.findOne.mockResolvedValue(null);

      await expect(repository.updateStatus('comment-id', CommentStatus.APPROVED)).rejects.toThrow(
        DomainError,
      );
    });

    it('should throw DomainError when update fails', async () => {
      typeOrmRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(repository.updateStatus('comment-id', CommentStatus.APPROVED)).rejects.toThrow(
        DomainError,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete comment', async () => {
      typeOrmRepository.softDelete.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await repository.softDelete('comment-id');

      expect(typeOrmRepository.softDelete).toHaveBeenCalledWith('comment-id');
    });

    it('should throw DomainError when delete fails', async () => {
      typeOrmRepository.softDelete.mockRejectedValue(new Error('Database error'));

      await expect(repository.softDelete('comment-id')).rejects.toThrow(DomainError);
    });
  });
});
