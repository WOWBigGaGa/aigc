import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { FriendLinkRepository } from '../repositories/friend-link.repository';
import { FriendLinkEntity } from '../entities/friend-link.entity';
import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';

export interface FriendLinkView {
  id: string;
  name: string;
  url: string;
  description: string | null;
  logo: string | null;
  sort: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class FriendLinkQueryService {
  constructor(private readonly friendLinkRepository: FriendLinkRepository) {}

  async getAllFriendLinks(
    transactionContext?: PersistenceTransactionContext,
  ): Promise<FriendLinkView[]> {
    try {
      const entities = await this.friendLinkRepository.findAll(transactionContext);
      return entities.map((entity) => this.mapToView(entity));
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取友链列表失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async getActiveFriendLinks(
    transactionContext?: PersistenceTransactionContext,
  ): Promise<FriendLinkView[]> {
    try {
      const entities = await this.friendLinkRepository.findActive(transactionContext);
      return entities.map((entity) => this.mapToView(entity));
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取启用的友链列表失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  async getFriendLinkCount(transactionContext?: PersistenceTransactionContext): Promise<number> {
    try {
      return await this.friendLinkRepository.count(transactionContext);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取友链数量失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  private mapToView(entity: FriendLinkEntity): FriendLinkView {
    return {
      id: entity.id,
      name: entity.name,
      url: entity.url,
      description: entity.description,
      logo: entity.logo,
      sort: entity.sort,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}