import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Repository } from 'typeorm';
import { getTypeOrmEntityManager } from '@src/infrastructure/database/transaction/typeorm-persistence-transaction-context';
import { ArticleEntity } from '../entities/article.entity';
import { ArticleStatus } from '../blog.types';

/**
 * 文章仓库
 * 负责文章的读写操作
 */
@Injectable()
export class ArticleRepository {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly repository: Repository<ArticleEntity>,
  ) {}

  /**
   * 分页查询已发布的文章
   */
  async findPublishedWithPagination(
    page: number,
    limit: number,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<{ items: ArticleEntity[]; total: number }> {
    try {
      const repository = this.getRepository(transactionContext);
      const [items, total] = await repository.findAndCount({
        where: { status: ArticleStatus.PUBLISHED, deletedAt: IsNull() },
        order: { isPinned: 'DESC', publishedAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { items, total };
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询已发布文章失败',
        {
          page,
          limit,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 根据分类查询文章
   */
  async findByCategory(
    categoryId: string,
    page: number,
    limit: number,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<{ items: ArticleEntity[]; total: number }> {
    try {
      const repository = this.getRepository(transactionContext);
      const [items, total] = await repository.findAndCount({
        where: { categoryId, status: ArticleStatus.PUBLISHED, deletedAt: IsNull() },
        order: { publishedAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { items, total };
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '根据分类查询文章失败',
        {
          categoryId,
          page,
          limit,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 根据标签查询文章
   */
  async findByTags(
    tagIds: string[],
    page: number,
    limit: number,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<{ items: ArticleEntity[]; total: number }> {
    try {
      const repository = this.getRepository(transactionContext);
      const queryBuilder = repository
        .createQueryBuilder('article')
        .innerJoin('article.tags', 'tag')
        .where('tag.id IN (:...tagIds)', { tagIds })
        .andWhere('article.status = :status', { status: ArticleStatus.PUBLISHED })
        .andWhere('article.deletedAt IS NULL')
        .orderBy('article.publishedAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [items, total] = await queryBuilder.getManyAndCount();
      return { items, total };
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '根据标签查询文章失败',
        {
          tagIds,
          page,
          limit,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 关键词搜索文章
   */
  async searchByKeyword(
    keyword: string,
    page: number,
    limit: number,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<{ items: ArticleEntity[]; total: number }> {
    try {
      const repository = this.getRepository(transactionContext);
      const [items, total] = await repository.findAndCount({
        where: [
          { title: Like(`%${keyword}%`), status: ArticleStatus.PUBLISHED, deletedAt: IsNull() },
          { content: Like(`%${keyword}%`), status: ArticleStatus.PUBLISHED, deletedAt: IsNull() },
        ],
        order: { publishedAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { items, total };
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '搜索文章失败',
        {
          keyword,
          page,
          limit,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 查询置顶文章
   */
  async findPinnedArticles(
    transactionContext?: PersistenceTransactionContext,
  ): Promise<ArticleEntity[]> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.find({
        where: { isPinned: true, status: ArticleStatus.PUBLISHED, deletedAt: IsNull() },
        order: { publishedAt: 'DESC' },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询置顶文章失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 增加阅读量
   */
  async incrementViewCount(
    articleId: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<void> {
    try {
      const repository = this.getRepository(transactionContext);
      await repository.increment({ id: articleId }, 'viewCount', 1);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.UPDATE_FAILED,
        '增加阅读量失败',
        {
          articleId,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 增加点赞量
   */
  async incrementLikeCount(
    articleId: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<void> {
    try {
      const repository = this.getRepository(transactionContext);
      await repository.increment({ id: articleId }, 'likeCount', 1);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.UPDATE_FAILED,
        '增加点赞量失败',
        {
          articleId,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 根据 ID 查询文章
   */
  async findById(
    id: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<ArticleEntity | null> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.findOne({
        where: { id, deletedAt: IsNull() },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询文章失败',
        {
          articleId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 创建文章
   */
  async create(
    article: Partial<ArticleEntity>,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<ArticleEntity> {
    try {
      const repository = this.getRepository(transactionContext);
      const newArticle = repository.create(article);
      return await repository.save(newArticle);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.CREATE_FAILED,
        '创建文章失败',
        {
          title: article.title,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 更新文章
   */
  async update(
    id: string,
    updates: Partial<ArticleEntity>,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<ArticleEntity> {
    try {
      const repository = this.getRepository(transactionContext);
      await repository.update(id, updates);
      const updated = await repository.findOne({ where: { id } });
      if (!updated) {
        throw new DomainError(BLOG_ERROR.NOT_FOUND, '文章不存在');
      }
      return updated;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.UPDATE_FAILED,
        '更新文章失败',
        {
          articleId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 软删除文章
   */
  async softDelete(id: string, transactionContext?: PersistenceTransactionContext): Promise<void> {
    try {
      const repository = this.getRepository(transactionContext);
      await repository.softDelete(id);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.DELETE_FAILED,
        '删除文章失败',
        {
          articleId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  private getRepository(
    transactionContext?: PersistenceTransactionContext,
  ): Repository<ArticleEntity> {
    const manager = transactionContext ? getTypeOrmEntityManager(transactionContext) : undefined;
    return manager ? manager.getRepository(ArticleEntity) : this.repository;
  }
}
