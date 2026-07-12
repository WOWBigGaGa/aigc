import { DomainError } from '@core/common/errors/domain-error';
import { Test, TestingModule } from '@nestjs/testing';
import { FriendLinkEntity } from '../entities/friend-link.entity';
import { FriendLinkRepository } from '../repositories/friend-link.repository';
import { FriendLinkQueryService } from './friend-link.query.service';

describe('FriendLinkQueryService', () => {
  let service: FriendLinkQueryService;
  let friendLinkRepository: any;

  const mockFriendLinkEntity = {
    id: 'link-1',
    name: 'Test Blog',
    url: 'https://test.com',
    description: 'A test blog',
    logo: 'https://test.com/logo.png',
    sort: 0,
    isActive: true,
    createdAt: new Date('2026-06-15'),
    updatedAt: new Date('2026-06-15'),
  } as FriendLinkEntity;

  const mockFriendLinkView = {
    id: 'link-1',
    name: 'Test Blog',
    url: 'https://test.com',
    description: 'A test blog',
    logo: 'https://test.com/logo.png',
    sort: 0,
    isActive: true,
    createdAt: new Date('2026-06-15'),
    updatedAt: new Date('2026-06-15'),
  };

  beforeEach(async () => {
    friendLinkRepository = {
      findAll: jest.fn(),
      findActive: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendLinkQueryService,
        { provide: FriendLinkRepository, useValue: friendLinkRepository },
      ],
    }).compile();

    service = module.get<FriendLinkQueryService>(FriendLinkQueryService);
  });

  describe('getAllFriendLinks', () => {
    it('should return all friend links as views', async () => {
      friendLinkRepository.findAll.mockResolvedValue([mockFriendLinkEntity]);

      const result = await service.getAllFriendLinks();

      expect(result).toEqual([mockFriendLinkView]);
    });

    it('should return empty array when no friend links exist', async () => {
      friendLinkRepository.findAll.mockResolvedValue([]);

      const result = await service.getAllFriendLinks();

      expect(result).toEqual([]);
    });

    it('should throw DomainError when repository throws DomainError', async () => {
      friendLinkRepository.findAll.mockRejectedValue(new DomainError('QUERY_FAILED', 'Database error'));

      await expect(service.getAllFriendLinks()).rejects.toThrow(DomainError);
    });

    it('should wrap unknown errors in DomainError', async () => {
      friendLinkRepository.findAll.mockRejectedValue(new Error('Unknown error'));

      await expect(service.getAllFriendLinks()).rejects.toThrow(DomainError);
    });
  });

  describe('getActiveFriendLinks', () => {
    it('should return active friend links as views', async () => {
      friendLinkRepository.findActive.mockResolvedValue([mockFriendLinkEntity]);

      const result = await service.getActiveFriendLinks();

      expect(result).toEqual([mockFriendLinkView]);
    });

    it('should return empty array when no active friend links exist', async () => {
      friendLinkRepository.findActive.mockResolvedValue([]);

      const result = await service.getActiveFriendLinks();

      expect(result).toEqual([]);
    });

    it('should throw DomainError when repository throws DomainError', async () => {
      friendLinkRepository.findActive.mockRejectedValue(new DomainError('QUERY_FAILED', 'Database error'));

      await expect(service.getActiveFriendLinks()).rejects.toThrow(DomainError);
    });

    it('should wrap unknown errors in DomainError', async () => {
      friendLinkRepository.findActive.mockRejectedValue(new Error('Unknown error'));

      await expect(service.getActiveFriendLinks()).rejects.toThrow(DomainError);
    });
  });

  describe('getFriendLinkCount', () => {
    it('should return friend link count', async () => {
      friendLinkRepository.count.mockResolvedValue(10);

      const result = await service.getFriendLinkCount();

      expect(result).toBe(10);
    });

    it('should return 0 when no friend links exist', async () => {
      friendLinkRepository.count.mockResolvedValue(0);

      const result = await service.getFriendLinkCount();

      expect(result).toBe(0);
    });

    it('should throw DomainError when repository throws DomainError', async () => {
      friendLinkRepository.count.mockRejectedValue(new DomainError('QUERY_FAILED', 'Database error'));

      await expect(service.getFriendLinkCount()).rejects.toThrow(DomainError);
    });

    it('should wrap unknown errors in DomainError', async () => {
      friendLinkRepository.count.mockRejectedValue(new Error('Unknown error'));

      await expect(service.getFriendLinkCount()).rejects.toThrow(DomainError);
    });
  });
});