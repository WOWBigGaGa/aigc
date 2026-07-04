import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import type { UsecaseSession } from '@app-types/auth/session.types';
import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '@src/modules/blog/repositories/comment.repository';
import { CommentQueryService } from '@src/modules/blog/queries/comment.query.service';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError, PERMISSION_ERROR } from '@core/common/errors/domain-error';
import { canManageComment } from '@core/blog/policy/blog-authorization.policy';
import { CommentStatus, CommentView } from '@src/modules/blog/blog.types';
import { normalizeCommentId, normalizeCommentStatus } from './blog.input.normalize';

@Injectable()
export class UpdateCommentStatusUsecase {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentQueryService: CommentQueryService,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    id,
    status,
    session,
    transactionContext,
  }: {
    id: string;
    status: CommentStatus;
    session: UsecaseSession;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<CommentView> {
    const normalizedId = normalizeCommentId(id);
    const normalizedStatus = normalizeCommentStatus(status);

    const run = async (activeTransactionContext: PersistenceTransactionContext) => {
      const comment = await this.commentRepository.findById(normalizedId, activeTransactionContext);
      if (!comment) {
        throw new DomainError(BLOG_ERROR.COMMENT_NOT_FOUND, '评论不存在', {
          commentId: normalizedId,
        });
      }

      if (!canManageComment(session)) {
        throw new DomainError(PERMISSION_ERROR.ACCESS_DENIED, '无权限更新评论状态');
      }

      await this.commentRepository.updateStatus(
        normalizedId,
        normalizedStatus,
        activeTransactionContext,
      );

      const updated = await this.commentQueryService.getCommentById(
        normalizedId,
        activeTransactionContext,
      );
      if (!updated) {
        throw new DomainError(BLOG_ERROR.COMMENT_NOT_FOUND, '评论不存在', {
          commentId: normalizedId,
        });
      }
      return updated;
    };

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }
}
