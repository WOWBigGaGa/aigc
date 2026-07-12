import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getTypeOrmEntityManager } from '@src/infrastructure/database/transaction/typeorm-persistence-transaction-context';
import { FriendLinkEntity } from '../entities/friend-link.entity';

@Injectable()
export class FriendLinkRepository {
  constructor(
    @InjectRepository(FriendLinkEntity)
    private readonly repository: Repository<FriendLinkEntity>,
  ) {}

  private getRepository(transactionContext?: PersistenceTransactionContext) {
    if (transactionContext) {
      return getTypeOrmEntityManager(transactionContext).getRepository(FriendLinkEntity);
    }
    return this.repository;
  }

  async findAll(transactionContext?: PersistenceTransactionContext): Promise<FriendLinkEntity[]> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.find({
        where: {},
        order: { sort: 'ASC', createdAt: 'ASC' },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询友链失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async findActive(
    transactionContext?: PersistenceTransactionContext,
  ): Promise<FriendLinkEntity[]> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.find({
        where: { isActive: true },
        order: { sort: 'ASC', createdAt: 'ASC' },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询启用的友链失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async findById(
    id: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<FriendLinkEntity | null> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询友链失败',
        {
          id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async count(transactionContext?: PersistenceTransactionContext): Promise<number> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.count();
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '统计友链数量失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async create(
    data: Partial<FriendLinkEntity>,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<FriendLinkEntity> {
    try {
      const repository = this.getRepository(transactionContext);
      const entity = repository.create(data);
      return await repository.save(entity);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.CREATE_FAILED,
        '创建友链失败',
        {
          data,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async update(
    id: string,
    data: Partial<FriendLinkEntity>,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<FriendLinkEntity> {
    try {
      const repository = this.getRepository(transactionContext);
      await repository.update(id, data);
      const updated = await this.findById(id, transactionContext);
      if (!updated) {
        throw new DomainError(BLOG_ERROR.UPDATE_FAILED, '友链不存在', { id });
      }
      return updated;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.UPDATE_FAILED,
        '更新友链失败',
        {
          id,
          data,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async delete(id: string, transactionContext?: PersistenceTransactionContext): Promise<void> {
    try {
      const repository = this.getRepository(transactionContext);
      await repository.delete(id);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.DELETE_FAILED,
        '删除友链失败',
        {
          id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }
}
