import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryEntity } from '../entities/category.entity';
import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';

@Injectable()
export class CategoryQueryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getAllCategories(
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CategoryEntity[]> {
    try {
      return await this.categoryRepository.findAll(transactionContext);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取分类列表失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async getCategoryCount(transactionContext?: PersistenceTransactionContext): Promise<number> {
    try {
      return await this.categoryRepository.count(transactionContext);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取分类数量失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }
}
