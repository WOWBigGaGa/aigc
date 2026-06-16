import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { getTypeOrmEntityManager } from '@src/infrastructure/database/transaction/typeorm-persistence-transaction-context';
import { CategoryEntity } from '../entities/category.entity';

/**
 * 分类仓库
 * 负责分类的读写操作，支持树形结构
 */
@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repository: Repository<CategoryEntity>,
  ) {}

  /**
   * 查询所有分类（树形结构）
   */
  async findAll(transactionContext?: PersistenceTransactionContext): Promise<CategoryEntity[]> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.find({
        where: {},
        order: { sort: 'ASC', createdAt: 'ASC' },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询分类失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 查询根分类（无父分类）
   */
  async findRootCategories(
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CategoryEntity[]> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.find({
        where: { parentId: IsNull() },
        order: { sort: 'ASC', createdAt: 'ASC' },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询根分类失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 根据 ID 查询分类
   */
  async findById(
    id: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CategoryEntity | null> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询分类失败',
        {
          categoryId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 根据 slug 查询分类
   */
  async findBySlug(
    slug: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CategoryEntity | null> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.findOne({
        where: { slug },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询分类失败',
        {
          slug,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 创建分类
   */
  async create(
    category: Partial<CategoryEntity>,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CategoryEntity> {
    try {
      const repository = this.getRepository(transactionContext);
      const newCategory = repository.create(category);
      return await repository.save(newCategory);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.CREATE_FAILED,
        '创建分类失败',
        {
          name: category.name,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 更新分类
   */
  async update(
    id: string,
    updates: Partial<CategoryEntity>,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CategoryEntity> {
    try {
      const repository = this.getRepository(transactionContext);
      await repository.update(id, updates);
      const updated = await repository.findOne({ where: { id } });
      if (!updated) {
        throw new DomainError(BLOG_ERROR.NOT_FOUND, '分类不存在');
      }
      return updated;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.UPDATE_FAILED,
        '更新分类失败',
        {
          categoryId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 删除分类
   */
  async delete(id: string, transactionContext?: PersistenceTransactionContext): Promise<void> {
    try {
      const repository = this.getRepository(transactionContext);
      await repository.delete(id);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.DELETE_FAILED,
        '删除分类失败',
        {
          categoryId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  private getRepository(
    transactionContext?: PersistenceTransactionContext,
  ): Repository<CategoryEntity> {
    const manager = transactionContext ? getTypeOrmEntityManager(transactionContext) : undefined;
    return manager ? manager.getRepository(CategoryEntity) : this.repository;
  }
}
