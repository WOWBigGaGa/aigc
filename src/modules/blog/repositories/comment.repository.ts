import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { getTypeOrmEntityManager } from '@src/infrastructure/database/transaction/typeorm-persistence-transaction-context';
import { CommentEntity } from '../entities/comment.entity';
import { CommentStatus } from '../blog.types';

/**
 * 评论仓库
 * 负责评论的读写操作
 */
@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repository: Repository<CommentEntity>,
  ) {}

  /**
   * 分页查询已审核的评论
   */
  async findApprovedByArticle(
    articleId: string,
    page: number,
    limit: number,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<{ items: CommentEntity[]; total: number }> {
    try {
      const repository = this.getRepository(transactionContext);
      const [items, total] = await repository.findAndCount({
        where: { articleId, status: CommentStatus.APPROVED, deletedAt: IsNull() },
        order: { createdAt: 'ASC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { items, total };
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询已审核评论失败',
        {
          articleId,
          page,
          limit,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 使用递归查询获取文章的所有已审核评论（包含子评论）
   */
  async findApprovedByArticleWithChildren(
    articleId: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CommentEntity[]> {
    try {
      const manager = transactionContext
        ? getTypeOrmEntityManager(transactionContext)
        : this.repository.manager;

      const query = `
        WITH RECURSIVE comment_tree AS (
          SELECT 
            c.id, c.article_id, c.author_name, c.author_email, c.author_avatar, 
            c.content, c.parent_id, c.status, c.created_at, c.updated_at, c.deleted_at,
            1 as level
          FROM comment c
          WHERE c.article_id = ? 
            AND c.status = ? 
            AND c.deleted_at IS NULL 
            AND c.parent_id IS NULL
          UNION ALL
          SELECT 
            c.id, c.article_id, c.author_name, c.author_email, c.author_avatar, 
            c.content, c.parent_id, c.status, c.created_at, c.updated_at, c.deleted_at,
            ct.level + 1 as level
          FROM comment c
          INNER JOIN comment_tree ct ON c.parent_id = ct.id
          WHERE c.status = ? 
            AND c.deleted_at IS NULL
            AND ct.level < 3
        )
        SELECT * FROM comment_tree ORDER BY level, created_at ASC;
      `;

      const result = await manager.query(query, [
        articleId,
        CommentStatus.APPROVED,
        CommentStatus.APPROVED,
      ]);

      return result.map((row: Record<string, unknown>) => {
        const entity = new CommentEntity();
        entity.id = row.id as string;
        entity.articleId = row.article_id as string;
        entity.authorName = row.author_name as string;
        entity.authorEmail = row.author_email as string;
        entity.authorAvatar = row.author_avatar as string;
        entity.content = row.content as string;
        entity.parentId = row.parent_id as string | null;
        entity.status = row.status as CommentStatus;
        entity.createdAt = row.created_at ? new Date(row.created_at as string) : new Date();
        entity.updatedAt = row.updated_at ? new Date(row.updated_at as string) : new Date();
        entity.deletedAt = row.deleted_at ? new Date(row.deleted_at as string) : null;
        return entity;
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询评论树失败',
        {
          articleId,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 分页查询待审核评论
   */
  async findPendingComments(
    page: number,
    limit: number,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<{ items: CommentEntity[]; total: number }> {
    try {
      const repository = this.getRepository(transactionContext);
      const [items, total] = await repository.findAndCount({
        where: { status: CommentStatus.PENDING, deletedAt: IsNull() },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { items, total };
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询待审核评论失败',
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
   * 根据 ID 查询评论
   */
  async findById(
    id: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CommentEntity | null> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.findOne({
        where: { id, deletedAt: IsNull() },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询评论失败',
        {
          commentId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 创建评论
   */
  async create(
    comment: Partial<CommentEntity>,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CommentEntity> {
    try {
      const repository = this.getRepository(transactionContext);
      const newComment = repository.create(comment);
      return await repository.save(newComment);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.CREATE_FAILED,
        '创建评论失败',
        {
          articleId: comment.articleId,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 更新评论状态
   */
  async updateStatus(
    id: string,
    status: CommentStatus,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CommentEntity> {
    try {
      const repository = this.getRepository(transactionContext);
      await repository.update(id, { status });
      const updated = await repository.findOne({ where: { id } });
      if (!updated) {
        throw new DomainError(BLOG_ERROR.NOT_FOUND, '评论不存在');
      }
      return updated;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(
        BLOG_ERROR.UPDATE_FAILED,
        '更新评论状态失败',
        {
          commentId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 软删除评论
   */
  async softDelete(id: string, transactionContext?: PersistenceTransactionContext): Promise<void> {
    try {
      const repository = this.getRepository(transactionContext);
      await repository.softDelete(id);
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.DELETE_FAILED,
        '删除评论失败',
        {
          commentId: id,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 查询指定评论的所有子评论（递归查询）
   */
  async findChildrenRecursively(
    parentId: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CommentEntity[]> {
    try {
      const repository = this.getRepository(transactionContext);
      const children = await repository.find({
        where: { parentId, deletedAt: IsNull() },
      });

      const allChildren: CommentEntity[] = [];
      for (const child of children) {
        allChildren.push(child);
        const grandchildren = await this.findChildrenRecursively(child.id, transactionContext);
        allChildren.push(...grandchildren);
      }

      return allChildren;
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询子评论失败',
        {
          parentId,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 获取评论总数
   */
  async count(transactionContext?: PersistenceTransactionContext): Promise<number> {
    try {
      const repository = this.getRepository(transactionContext);
      return await repository.count({
        where: { deletedAt: IsNull() },
      });
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '统计评论总数失败',
        {
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  /**
   * 查询评论的层级深度
   */
  async getCommentDepth(
    commentId: string,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<number> {
    try {
      const repository = this.getRepository(transactionContext);
      let depth = 0;
      let currentId = commentId;

      while (currentId) {
        const comment = await repository.findOne({
          where: { id: currentId, deletedAt: IsNull() },
          select: { parentId: true },
        });
        if (!comment) {
          break;
        }
        if (comment.parentId) {
          depth++;
          currentId = comment.parentId;
        } else {
          break;
        }
      }

      return depth;
    } catch (error) {
      throw new DomainError(
        BLOG_ERROR.QUERY_FAILED,
        '查询评论层级失败',
        {
          commentId,
          error: error instanceof Error ? error.message : '未知错误',
        },
        error,
      );
    }
  }

  private getRepository(
    transactionContext?: PersistenceTransactionContext,
  ): Repository<CommentEntity> {
    const manager = transactionContext ? getTypeOrmEntityManager(transactionContext) : undefined;
    return manager ? manager.getRepository(CommentEntity) : this.repository;
  }
}
