import { DomainError } from '@core/common/errors/domain-error';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FriendLinkEntity } from '../entities/friend-link.entity';
import { FriendLinkRepository } from './friend-link.repository';

describe('FriendLinkRepository', () => {
  let repository: FriendLinkRepository;
  let typeOrmRepository: any;

  const mockFriendLink = {
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

  beforeEach(async () => {
    typeOrmRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendLinkRepository,
        {
          provide: getRepositoryToken(FriendLinkEntity),
          useValue: typeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<FriendLinkRepository>(FriendLinkRepository);
  });

  describe('findAll', () => {
    it('should return all friend links', async () => {
      typeOrmRepository.find.mockResolvedValue([mockFriendLink]);

      const result = await repository.findAll();

      expect(result).toEqual([mockFriendLink]);
      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { sort: 'ASC', createdAt: 'ASC' },
      });
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(repository.findAll()).rejects.toThrow(DomainError);
    });
  });

  describe('findActive', () => {
    it('should return active friend links', async () => {
      typeOrmRepository.find.mockResolvedValue([mockFriendLink]);

      const result = await repository.findActive();

      expect(result).toEqual([mockFriendLink]);
      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { sort: 'ASC', createdAt: 'ASC' },
      });
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(repository.findActive()).rejects.toThrow(DomainError);
    });
  });

  describe('findById', () => {
    it('should return friend link when found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockFriendLink);

      const result = await repository.findById('link-1');

      expect(result).toEqual(mockFriendLink);
    });

    it('should return null when friend link not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('link-1');

      expect(result).toBeNull();
    });

    it('should throw DomainError when query fails', async () => {
      typeOrmRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(repository.findById('link-1')).rejects.toThrow(DomainError);
    });
  });

  describe('count', () => {
    it('should return friend link count', async () => {
      typeOrmRepository.count.mockResolvedValue(10);

      const result = await repository.count();

      expect(result).toBe(10);
    });

    it('should throw DomainError when count fails', async () => {
      typeOrmRepository.count.mockRejectedValue(new Error('Database error'));

      await expect(repository.count()).rejects.toThrow(DomainError);
    });
  });

  describe('create', () => {
    it('should create and return friend link', async () => {
      const linkData = { name: 'New Link', url: 'https://new.com' };
      typeOrmRepository.create.mockReturnValue({ ...linkData });
      typeOrmRepository.save.mockResolvedValue({ ...linkData, id: 'new-id' });

      const result = await repository.create(linkData);

      expect(result).toEqual({ ...linkData, id: 'new-id' });
    });

    it('should throw DomainError when creation fails', async () => {
      typeOrmRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(repository.create({ name: 'New Link' })).rejects.toThrow(DomainError);
    });
  });

  describe('update', () => {
    it('should update and return friend link', async () => {
      const updates = { name: 'Updated Name' };
      typeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      typeOrmRepository.findOne.mockResolvedValue({ ...mockFriendLink, ...updates });

      const result = await repository.update('link-1', updates);

      expect(result).toEqual({ ...mockFriendLink, ...updates });
    });

    it('should throw DomainError when friend link not found', async () => {
      typeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      typeOrmRepository.findOne.mockResolvedValue(null);

      await expect(repository.update('link-1', { name: 'Updated' })).rejects.toThrow(DomainError);
    });

    it('should throw DomainError when update fails', async () => {
      typeOrmRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(repository.update('link-1', { name: 'Updated' })).rejects.toThrow(DomainError);
    });
  });

  describe('delete', () => {
    it('should delete friend link', async () => {
      typeOrmRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await repository.delete('link-1');

      expect(typeOrmRepository.delete).toHaveBeenCalledWith('link-1');
    });

    it('should throw DomainError when delete fails', async () => {
      typeOrmRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(repository.delete('link-1')).rejects.toThrow(DomainError);
    });
  });
});