import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { TagEntity } from '../entities/tag.entity';
import { ArticleTagEntity } from '../entities/article-tag.entity';
import { TagRepository } from './tag.repository';

describe('TagRepository', () => {
  let repository: TagRepository;
  let tagTypeOrmRepository: any;
  let articleTagTypeOrmRepository: any;

  const mockTag: TagEntity = {
    id: 'tag-1',
    name: 'Test Tag',
    slug: 'test-tag',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagRepository,
        {
          provide: getRepositoryToken(TagEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ArticleTagEntity),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<TagRepository>(TagRepository);
    tagTypeOrmRepository = module.get(getRepositoryToken(TagEntity));
    articleTagTypeOrmRepository = module.get(getRepositoryToken(ArticleTagEntity));
  });

  describe('findAll', () => {
    it('should return all tags', async () => {
      tagTypeOrmRepository.find.mockResolvedValue([mockTag]);

      const result = await repository.findAll();

      expect(result).toEqual([mockTag]);
      expect(tagTypeOrmRepository.find).toHaveBeenCalled();
    });

    it('should throw DomainError when query fails', async () => {
      tagTypeOrmRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(repository.findAll()).rejects.toThrow(DomainError);
      await expect(repository.findAll()).rejects.toHaveProperty('code', BLOG_ERROR.QUERY_FAILED);
    });
  });

  describe('findById', () => {
    it('should return tag by ID', async () => {
      tagTypeOrmRepository.findOne.mockResolvedValue(mockTag);

      const result = await repository.findById('tag-1');

      expect(result).toEqual(mockTag);
      expect(tagTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 'tag-1' } });
    });

    it('should return null when tag not found', async () => {
      tagTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return tag by name', async () => {
      tagTypeOrmRepository.findOne.mockResolvedValue(mockTag);

      const result = await repository.findByName('Test Tag');

      expect(result).toEqual(mockTag);
      expect(tagTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Test Tag' } });
    });
  });

  describe('findBySlug', () => {
    it('should return tag by slug', async () => {
      tagTypeOrmRepository.findOne.mockResolvedValue(mockTag);

      const result = await repository.findBySlug('test-tag');

      expect(result).toEqual(mockTag);
      expect(tagTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { slug: 'test-tag' } });
    });
  });

  describe('create', () => {
    it('should create and return tag', async () => {
      tagTypeOrmRepository.create.mockReturnValue(mockTag);
      tagTypeOrmRepository.save.mockResolvedValue(mockTag);

      const result = await repository.create({ name: 'Test Tag', slug: 'test-tag' });

      expect(result).toEqual(mockTag);
      expect(tagTypeOrmRepository.create).toHaveBeenCalled();
      expect(tagTypeOrmRepository.save).toHaveBeenCalled();
    });

    it('should throw DomainError when creation fails', async () => {
      tagTypeOrmRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(repository.create({ name: 'Test Tag' })).rejects.toThrow(DomainError);
      await expect(repository.create({ name: 'Test Tag' })).rejects.toHaveProperty(
        'code',
        BLOG_ERROR.CREATE_FAILED,
      );
    });
  });

  describe('update', () => {
    it('should update and return tag', async () => {
      tagTypeOrmRepository.update.mockResolvedValue({ affected: 1 });
      tagTypeOrmRepository.findOne.mockResolvedValue({ ...mockTag, name: 'Updated Tag' });

      const result = await repository.update('tag-1', { name: 'Updated Tag' });

      expect(result.name).toBe('Updated Tag');
      expect(tagTypeOrmRepository.update).toHaveBeenCalled();
    });

    it('should throw DomainError when tag not found', async () => {
      tagTypeOrmRepository.update.mockResolvedValue({ affected: 1 });
      tagTypeOrmRepository.findOne.mockResolvedValue(null);

      await expect(repository.update('tag-1', { name: 'Updated' })).rejects.toThrow(DomainError);
      await expect(repository.update('tag-1', { name: 'Updated' })).rejects.toHaveProperty(
        'code',
        BLOG_ERROR.NOT_FOUND,
      );
    });
  });

  describe('delete', () => {
    it('should delete tag and related article tags', async () => {
      articleTagTypeOrmRepository.delete.mockResolvedValue({ affected: 1 });
      tagTypeOrmRepository.delete.mockResolvedValue({ affected: 1 });

      await repository.delete('tag-1');

      expect(articleTagTypeOrmRepository.delete).toHaveBeenCalledWith({ tagId: 'tag-1' });
      expect(tagTypeOrmRepository.delete).toHaveBeenCalledWith('tag-1');
    });
  });

  describe('addTagsToArticle', () => {
    it('should add tags to article', async () => {
      articleTagTypeOrmRepository.find.mockResolvedValue([]);
      articleTagTypeOrmRepository.save.mockResolvedValue([
        { articleId: 'article-1', tagId: 'tag-1' },
      ]);

      await repository.addTagsToArticle('article-1', ['tag-1', 'tag-2']);

      expect(articleTagTypeOrmRepository.save).toHaveBeenCalled();
    });

    it('should skip existing tags', async () => {
      articleTagTypeOrmRepository.find.mockResolvedValue([
        { articleId: 'article-1', tagId: 'tag-1' },
      ]);

      await repository.addTagsToArticle('article-1', ['tag-1', 'tag-2']);

      expect(articleTagTypeOrmRepository.save).toHaveBeenCalledWith([
        { articleId: 'article-1', tagId: 'tag-2' },
      ]);
    });
  });

  describe('removeTagsFromArticle', () => {
    it('should remove tags from article', async () => {
      articleTagTypeOrmRepository.delete.mockResolvedValue({ affected: 1 });

      await repository.removeTagsFromArticle('article-1', ['tag-1', 'tag-2']);

      expect(articleTagTypeOrmRepository.delete).toHaveBeenCalledWith({
        articleId: 'article-1',
        tagId: In(['tag-1', 'tag-2']),
      });
    });
  });

  describe('updateArticleTags', () => {
    it('should update article tags', async () => {
      articleTagTypeOrmRepository.delete.mockResolvedValue({ affected: 2 });
      articleTagTypeOrmRepository.save.mockResolvedValue([
        { articleId: 'article-1', tagId: 'tag-3' },
      ]);

      await repository.updateArticleTags('article-1', ['tag-3']);

      expect(articleTagTypeOrmRepository.delete).toHaveBeenCalledWith({ articleId: 'article-1' });
      expect(articleTagTypeOrmRepository.save).toHaveBeenCalled();
    });

    it('should handle empty tag list', async () => {
      articleTagTypeOrmRepository.delete.mockResolvedValue({ affected: 2 });

      await repository.updateArticleTags('article-1', []);

      expect(articleTagTypeOrmRepository.delete).toHaveBeenCalled();
      expect(articleTagTypeOrmRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getTagsByArticle', () => {
    it('should return tags for article', async () => {
      articleTagTypeOrmRepository.find.mockResolvedValue([
        { articleId: 'article-1', tagId: 'tag-1' },
      ]);
      tagTypeOrmRepository.find.mockResolvedValue([mockTag]);

      const result = await repository.getTagsByArticle('article-1');

      expect(result).toEqual([mockTag]);
    });

    it('should return empty array when no tags', async () => {
      articleTagTypeOrmRepository.find.mockResolvedValue([]);

      const result = await repository.getTagsByArticle('article-1');

      expect(result).toEqual([]);
    });
  });

  describe('getPopularTags', () => {
    it('should return popular tags', async () => {
      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ tagId: 'tag-1', articleCount: '5' }]),
      };
      articleTagTypeOrmRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      tagTypeOrmRepository.find.mockResolvedValue([mockTag]);

      const result = await repository.getPopularTags(10);

      expect(result.length).toBe(1);
      expect(result[0].tag).toEqual(mockTag);
      expect(result[0].articleCount).toBe(5);
    });
  });
});
