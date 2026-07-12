import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getTypeOrmEntityManager } from '@src/infrastructure/database/transaction/typeorm-persistence-transaction-context';
import { ArticleLikeEntity } from '../entities/article-like.entity';

@Injectable()
export class ArticleLikeRepository {
  constructor(
    @InjectRepository(ArticleLikeEntity)
    private readonly repository: Repository<ArticleLikeEntity>,
  ) {}

  async create(
    data: { articleId: string; userId?: string | null; ipAddress?: string | null },
    transactionContext?: PersistenceTransactionContext,
  ): Promise<ArticleLikeEntity> {
    try {
      const repository = this.getRepository(transactionContext);
      const like = repository.create({
        articleId: data.articleId,
        userId: data.userId ?? null,
        ipAddress: data.ipAddress ?? null,
      });
      return await repository.save(like);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.CREATE_FAILED,
        '创建点赞记录失败',
        {
          articleId: data.articleId,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async findByArticleAndUser(
    articleId: string,
    userId: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<ArticleLikeEntity | null> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.findOne({
        where: { articleId, userId },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询点赞记录失败',
        {
          articleId,
          userId,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async findByArticleAndIp(
    articleId: string,
    ipAddress: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<ArticleLikeEntity | null> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.findOne({
        where: { articleId, ipAddress },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询点赞记录失败',
        {
          articleId,
          ipAddress,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async deleteByArticleAndUser(
    articleId: string,
    userId: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<void> {
    try {
      const repository = this.getRepository(transactionContext);
      await repository.delete({ articleId, userId });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.DELETE_FAILED,
        '取消点赞失败',
        {
          articleId,
          userId,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async deleteByArticleAndIp(
    articleId: string,
    ipAddress: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<void> {
    try {
      const repository = this.getRepository(transactionContext);
      await repository.delete({ articleId, ipAddress });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.DELETE_FAILED,
        '取消点赞失败',
        {
          articleId,
          ipAddress,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async countByArticle(
    articleId: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<number> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.count({ where: { articleId } });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '统计点赞数失败',
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
  ): Repository<ArticleLikeEntity> {
    const manager = transactionContext ? getTypeOrmEntityManager(transactionContext) : undefined;
    return manager ? manager.getRepository(ArticleLikeEntity) : this.repository;
  }
}
