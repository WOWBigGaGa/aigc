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
import { normalizeCommentId } from './blog.input.normalize';

@Injectable()
export class RejectCommentUsecase {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentQueryService: CommentQueryService,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    id,
    session,
    transactionContext,
  }: {
    id: string;
    session: UsecaseSession;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<CommentView> {
    const normalizedId = normalizeCommentId(id);

    const run = async (activeTransactionContext: PersistenceTransactionContext) => {
      const comment = await this.commentRepository.findById(normalizedId, activeTransactionContext);
      if (!comment) {
        throw new DomainError(BLOG_ERROR.COMMENT_NOT_FOUND, '评论不存在', {
          commentId: normalizedId,
        });
      }

      if (!canManageComment(session)) {
        throw new DomainError(PERMISSION_ERROR.ACCESS_DENIED, '无权限审核评论');
      }

      const updated = await this.commentRepository.updateStatus(
        normalizedId,
        CommentStatus.REJECTED,
        activeTransactionContext,
      );

      const result = await this.commentQueryService.getCommentById(
        updated.id,
        activeTransactionContext,
      );
      if (!result) {
        throw new DomainError(BLOG_ERROR.UPDATE_FAILED, '拒绝评论失败');
      }
      return result;
    };

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }
}
