import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, LessThan, MoreThan, Repository, FindOperator } from 'typeorm';
import { getTypeOrmEntityManager } from '@src/infrastructure/database/transaction/typeorm-persistence-transaction-context';
import { ArticleEntity } from '../entities/article.entity';
import { ArticleStatus, ArticleUpdateData } from '../blog.types';

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
    updates: ArticleUpdateData,
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

  /**
   * 获取归档统计（按年月分组）
   */
  async getArchives(
    transactionContext?: PersistenceTransactionContext,
  ): Promise<{ year: number; month: number; count: number }[]> {
    try {
      const repository = this.getRepository(transactionContext);
      const result = await repository
        .createQueryBuilder('article')
        .select([
          'YEAR(article.published_at) as year',
          'MONTH(article.published_at) as month',
          'COUNT(article.id) as count',
        ])
        .where('article.status = :status', { status: ArticleStatus.PUBLISHED })
        .andWhere('article.published_at IS NOT NULL')
        .andWhere('article.deleted_at IS NULL')
        .groupBy('year, month')
        .orderBy('year', 'DESC')
        .addOrderBy('month', 'DESC')
        .getRawMany<{ year: number; month: number; count: number }>();

      return result.map((row) => ({
        year: row.year,
        month: row.month,
        count: row.count,
      }));
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取归档统计失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 获取文章聚合统计（总浏览量、总点赞数）
   */
  async getArticleStats(
    transactionContext?: PersistenceTransactionContext,
  ): Promise<{ totalViewCount: number; totalLikeCount: number; totalPublishedCount: number }> {
    try {
      const repository = this.getRepository(transactionContext);
      const result = await repository
        .createQueryBuilder('article')
        .select([
          'COALESCE(SUM(article.view_count), 0) as totalViewCount',
          'COALESCE(SUM(article.like_count), 0) as totalLikeCount',
          'COUNT(article.id) as totalPublishedCount',
        ])
        .where('article.status = :status', { status: ArticleStatus.PUBLISHED })
        .andWhere('article.deleted_at IS NULL')
        .getRawOne<{
          totalViewCount: string;
          totalLikeCount: string;
          totalPublishedCount: string;
        }>();

      return {
        totalViewCount: parseInt(result?.totalViewCount || '0', 10),
        totalLikeCount: parseInt(result?.totalLikeCount || '0', 10),
        totalPublishedCount: parseInt(result?.totalPublishedCount || '0', 10),
      };
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取文章统计失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 获取分类统计
   */
  async getCategoryStats(
    transactionContext?: PersistenceTransactionContext,
  ): Promise<{ categoryId: string; categoryName: string; articleCount: number }[]> {
    try {
      const repository = this.getRepository(transactionContext);
      const result = await repository
        .createQueryBuilder('article')
        .select([
          'article.category_id as categoryId',
          'category.name as categoryName',
          'COUNT(article.id) as articleCount',
        ])
        .leftJoin('category', 'category', 'article.category_id = category.id')
        .where('article.status = :status', { status: ArticleStatus.PUBLISHED })
        .andWhere('article.deleted_at IS NULL')
        .andWhere('article.category_id IS NOT NULL')
        .groupBy('article.category_id, category.name')
        .orderBy('articleCount', 'DESC')
        .getRawMany<{ categoryId: string; categoryName: string; articleCount: string }>();

      return result.map((row) => ({
        categoryId: row.categoryId,
        categoryName: row.categoryName || '未分类',
        articleCount: parseInt(row.articleCount, 10) || 0,
      }));
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取分类统计失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 获取相邻文章（上一篇和下一篇）
   */
  async findAdjacentArticles(
    articleId: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<{ prev: ArticleEntity | null; next: ArticleEntity | null }> {
    try {
      const repository = this.getRepository(transactionContext);
      const currentArticle = await repository.findOne({
        where: { id: articleId, deletedAt: IsNull() },
      });

      if (!currentArticle || !currentArticle.publishedAt) {
        return { prev: null, next: null };
      }

      const prevArticle = await repository.findOne({
        where: {
          status: ArticleStatus.PUBLISHED,
          deletedAt: IsNull(),
          publishedAt: LessThan(currentArticle.publishedAt),
        },
        order: { publishedAt: 'DESC' },
      });

      const nextArticle = await repository.findOne({
        where: {
          status: ArticleStatus.PUBLISHED,
          deletedAt: IsNull(),
          publishedAt: MoreThan(currentArticle.publishedAt),
        },
        order: { publishedAt: 'ASC' },
      });

      return { prev: prevArticle, next: nextArticle };
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取相邻文章失败',
        {
          articleId,
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
