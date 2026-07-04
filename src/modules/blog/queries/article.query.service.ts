import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { ArticleRepository } from '../repositories/article.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { ArticleEntity } from '../entities/article.entity';
import {
  ArticleView,
  ArticleFilterInput,
  PaginationInput,
  PaginatedResult,
  Archive,
  CategoryStats,
} from '../blog.types';
import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';

/**
 * 文章查询服务
 * 负责文章的只读查询、权限判定与输出规范化
 */
@Injectable()
export class ArticleQueryService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  /**
   * 获取文章列表（支持筛选和分页）
   */
  async getArticles(
    filter: ArticleFilterInput,
    pagination: PaginationInput,
  ): Promise<PaginatedResult<ArticleView>> {
    try {
      const { page, limit } = pagination;
      let result: { items: ArticleEntity[]; total: number };

      // 根据筛选条件选择查询方法
      if (filter.tagIds && filter.tagIds.length > 0) {
        result = await this.articleRepository.findByTags(filter.tagIds, page, limit);
      } else if (filter.categoryId) {
        result = await this.articleRepository.findByCategory(filter.categoryId, page, limit);
      } else if (filter.keyword) {
        result = await this.articleRepository.searchByKeyword(filter.keyword, page, limit);
      } else {
        result = await this.articleRepository.findPublishedWithPagination(page, limit);
      }

      // 转换为视图
      const items = result.items.map((entity) => this.mapToView(entity));
      const totalPages = Math.ceil(result.total / limit);
      const hasNext = page < totalPages;

      return {
        items,
        total: result.total,
        page,
        pageSize: limit,
        pageInfo: {
          hasNext,
        },
      };
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取文章列表失败',
        {
          filter,
          pagination,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 根据 ID 获取文章
   */
  async getArticleById(
    id: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<ArticleView | null> {
    try {
      const article = await this.articleRepository.findById(id, transactionContext);
      return article ? this.mapToView(article) : null;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取文章失败',
        {
          articleId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 获取归档统计（按年月统计文章数）
   */
  async getArchives(): Promise<Archive[]> {
    try {
      const result = await this.articleRepository.getArchives();
      return result;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
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
   * 获取分类统计
   */
  async getCategoryStats(): Promise<CategoryStats[]> {
    try {
      const result = await this.articleRepository.getCategoryStats();
      return result;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
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
   * 将实体映射为视图
   */
  private mapToView(entity: ArticleEntity): ArticleView {
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      coverImage: entity.coverImage,
      summary: entity.summary,
      status: entity.status,
      categoryId: entity.categoryId,
      authorId: entity.authorId,
      viewCount: entity.viewCount,
      likeCount: entity.likeCount,
      isPinned: entity.isPinned,
      publishedAt: entity.publishedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
