import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { getTypeOrmEntityManager } from '@src/infrastructure/database/transaction/typeorm-persistence-transaction-context';
import { TagEntity } from '../entities/tag.entity';
import { ArticleTagEntity } from '../entities/article-tag.entity';

/**
 * 标签仓库
 * 负责标签的读写操作和文章标签关联管理
 */
@Injectable()
export class TagRepository {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(ArticleTagEntity)
    private readonly articleTagRepository: Repository<ArticleTagEntity>,
  ) {}

  /**
   * 查询所有标签
   */
  async findAll(transactionContext?: PersistenceTransactionContext): Promise<TagEntity[]> {
    try {
      const repository = this.getTagRepository(transactionContext);
      return await repository.find({
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询标签失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 获取标签总数
   */
  async count(transactionContext?: PersistenceTransactionContext): Promise<number> {
    try {
      const repository = this.getTagRepository(transactionContext);
      return await repository.count();
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '统计标签数量失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 根据 ID 查询标签
   */
  async findById(
    id: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<TagEntity | null> {
    try {
      const repository = this.getTagRepository(transactionContext);
      return await repository.findOne({ where: { id } });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询标签失败',
        {
          tagId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 根据名称查询标签
   */
  async findByName(
    name: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<TagEntity | null> {
    try {
      const repository = this.getTagRepository(transactionContext);
      return await repository.findOne({ where: { name } });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询标签失败',
        {
          name,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 根据 slug 查询标签
   */
  async findBySlug(
    slug: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<TagEntity | null> {
    try {
      const repository = this.getTagRepository(transactionContext);
      return await repository.findOne({ where: { slug } });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询标签失败',
        {
          slug,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 创建标签
   */
  async create(
    tag: Partial<TagEntity>,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<TagEntity> {
    try {
      const repository = this.getTagRepository(transactionContext);
      const newTag = repository.create(tag);
      return await repository.save(newTag);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.CREATE_FAILED,
        '创建标签失败',
        {
          name: tag.name,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 更新标签
   */
  async update(
    id: string,
    updates: Partial<TagEntity>,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<TagEntity> {
    try {
      const repository = this.getTagRepository(transactionContext);
      await repository.update(id, updates);
      const updated = await repository.findOne({ where: { id } });
      if (!updated) {
        throw new DomainError(BLOG_ERROR.NOT_FOUND, '标签不存在');
      }
      return updated;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.UPDATE_FAILED,
        '更新标签失败',
        {
          tagId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 删除标签（级联删除文章标签关联）
   */
  async delete(id: string, transactionContext?: PersistenceTransactionContext): Promise<void> {
    try {
      const tagRepository = this.getTagRepository(transactionContext);
      const articleTagRepository = this.getArticleTagRepository(transactionContext);

      await articleTagRepository.delete({ tagId: id });
      await tagRepository.delete(id);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.DELETE_FAILED,
        '删除标签失败',
        {
          tagId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 为文章添加标签
   */
  async addTagsToArticle(
    articleId: string,
    tagIds: string[],
    transactionContext?: PersistenceTransactionContext,
  ): Promise<void> {
    try {
      const repository = this.getArticleTagRepository(transactionContext);

      const existingRelations = await repository.find({ where: { articleId } });
      const existingTagIds = existingRelations.map((rel) => rel.tagId);

      const newRelations = tagIds
        .filter((tagId) => !existingTagIds.includes(tagId))
        .map((tagId) => ({ articleId, tagId }));

      if (newRelations.length > 0) {
        await repository.save(newRelations);
      }
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.UPDATE_FAILED,
        '添加文章标签失败',
        {
          articleId,
          tagIds,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 从文章移除标签
   */
  async removeTagsFromArticle(
    articleId: string,
    tagIds: string[],
    transactionContext?: PersistenceTransactionContext,
  ): Promise<void> {
    try {
      const repository = this.getArticleTagRepository(transactionContext);
      await repository.delete({ articleId, tagId: In(tagIds) });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.UPDATE_FAILED,
        '移除文章标签失败',
        {
          articleId,
          tagIds,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 更新文章标签（先删除再添加）
   */
  async updateArticleTags(
    articleId: string,
    tagIds: string[],
    transactionContext?: PersistenceTransactionContext,
  ): Promise<void> {
    try {
      const repository = this.getArticleTagRepository(transactionContext);

      await repository.delete({ articleId });

      if (tagIds.length > 0) {
        const relations = tagIds.map((tagId) => ({ articleId, tagId }));
        await repository.save(relations);
      }
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.UPDATE_FAILED,
        '更新文章标签失败',
        {
          articleId,
          tagIds,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 获取文章的标签列表
   */
  async getTagsByArticle(
    articleId: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<TagEntity[]> {
    try {
      const articleTagRepository = this.getArticleTagRepository(transactionContext);
      const tagRepository = this.getTagRepository(transactionContext);

      const relations = await articleTagRepository.find({ where: { articleId } });
      const tagIds = relations.map((rel) => rel.tagId);

      if (tagIds.length === 0) {
        return [];
      }

      return await tagRepository.find({ where: { id: In(tagIds) } });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取文章标签失败',
        {
          articleId,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 获取热门标签（按文章数量排序）
   */
  async getPopularTags(
    limit: number = 10,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<{ tag: TagEntity; articleCount: number }[]> {
    try {
      const articleTagRepository = this.getArticleTagRepository(transactionContext);
      const tagRepository = this.getTagRepository(transactionContext);

      const result = await articleTagRepository
        .createQueryBuilder('article_tag')
        .select(['article_tag.tag_id as tagId', 'COUNT(article_tag.article_id) as articleCount'])
        .groupBy('article_tag.tag_id')
        .orderBy('articleCount DESC')
        .limit(limit)
        .getRawMany<{ tagId: string; articleCount: number }>();

      const tagIds = result.map((row) => row.tagId);
      const tags = await tagRepository.find({ where: { id: In(tagIds) } });
      const tagMap = new Map(tags.map((tag) => [tag.id, tag]));

      return result.map((row) => ({
        tag: tagMap.get(row.tagId)!,
        articleCount: row.articleCount,
      }));
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取热门标签失败',
        {
          limit,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  private getTagRepository(
    transactionContext?: PersistenceTransactionContext,
  ): Repository<TagEntity> {
    const manager = transactionContext ? getTypeOrmEntityManager(transactionContext) : undefined;
    return manager ? manager.getRepository(TagEntity) : this.tagRepository;
  }

  private getArticleTagRepository(
    transactionContext?: PersistenceTransactionContext,
  ): Repository<ArticleTagEntity> {
    const manager = transactionContext ? getTypeOrmEntityManager(transactionContext) : undefined;
    return manager ? manager.getRepository(ArticleTagEntity) : this.articleTagRepository;
  }
}
