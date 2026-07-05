import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { TagRepository } from '../repositories/tag.repository';
import { TagEntity } from '../entities/tag.entity';
import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';

@Injectable()
export class TagQueryService {
  constructor(private readonly tagRepository: TagRepository) {}

  async getAllTags(transactionContext?: PersistenceTransactionContext): Promise<TagEntity[]> {
    try {
      return await this.tagRepository.findAll(transactionContext);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取标签列表失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async getTagCount(transactionContext?: PersistenceTransactionContext): Promise<number> {
    try {
      const tags = await this.tagRepository.findAll(transactionContext);
      return tags.length;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取标签数量失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }
}
