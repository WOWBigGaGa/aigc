import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { CommentRepository } from '../repositories/comment.repository';
import { CommentEntity } from '../entities/comment.entity';
import { CommentView, CommentTreeNode, PaginationInput, PaginatedResult } from '../blog.types';
import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';

/**
 * 评论查询服务
 * 负责评论的只读查询、权限判定与输出规范化
 */
@Injectable()
export class CommentQueryService {
  constructor(private readonly commentRepository: CommentRepository) {}

  /**
   * 获取文章的评论列表（树形结构）
   */
  async getCommentsByArticle(
    articleId: string,
    pagination: PaginationInput,
  ): Promise<PaginatedResult<CommentTreeNode>> {
    try {
      const { page, limit } = pagination;
      const result = await this.commentRepository.findApprovedByArticle(articleId, page, limit);

      // 构建评论树
      const tree = this.buildCommentTree(result.items);

      const totalPages = Math.ceil(result.total / limit);
      const hasNext = page < totalPages;

      return {
        items: tree,
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
        '获取评论列表失败',
        {
          articleId,
          pagination,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 获取待审核评论列表
   */
  async getPendingComments(pagination: PaginationInput): Promise<PaginatedResult<CommentView>> {
    try {
      const { page, limit } = pagination;
      const result = await this.commentRepository.findPendingComments(page, limit);

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
        '获取待审核评论失败',
        {
          pagination,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 根据 ID 获取评论
   */
  async getCommentById(
    id: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CommentView | null> {
    try {
      const comment = await this.commentRepository.findById(id, transactionContext);
      return comment ? this.mapToView(comment) : null;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '获取评论失败',
        {
          commentId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 构建评论树（楼中楼结构）
   */
  private buildCommentTree(comments: CommentEntity[]): CommentTreeNode[] {
    const commentMap = new Map<string, CommentTreeNode>();
    const rootComments: CommentTreeNode[] = [];

    // 第一遍：创建所有节点
    for (const comment of comments) {
      const node: CommentTreeNode = {
        ...this.mapToView(comment),
        children: [],
      };
      commentMap.set(comment.id, node);
    }

    // 第二遍：构建树形结构
    for (const comment of comments) {
      const node = commentMap.get(comment.id);
      if (!node) continue;

      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // 父评论不存在，作为根评论处理
          rootComments.push(node);
        }
      } else {
        rootComments.push(node);
      }
    }

    return rootComments;
  }

  /**
   * 将实体映射为视图
   */
  private mapToView(entity: CommentEntity): CommentView {
    return {
      id: entity.id,
      articleId: entity.articleId,
      authorName: entity.authorName,
      authorEmail: entity.authorEmail,
      authorAvatar: entity.authorAvatar,
      content: entity.content,
      parentId: entity.parentId,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
