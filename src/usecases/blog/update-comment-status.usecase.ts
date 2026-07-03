import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '@src/modules/blog/repositories/comment.repository';
import { CommentQueryService } from '@src/modules/blog/queries/comment.query.service';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { CommentStatus, CommentView } from '@src/modules/blog/blog.types';

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
    transactionContext,
  }: {
    id: string;
    status: CommentStatus;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<CommentView> {
    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doUpdate(activeTransactionContext, id, status);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private async doUpdate(
    transactionContext: PersistenceTransactionContext,
    id: string,
    status: CommentStatus,
  ): Promise<CommentView> {
    const comment = await this.commentRepository.findById(id, transactionContext);
    if (!comment) {
      throw new DomainError(BLOG_ERROR.COMMENT_NOT_FOUND, '评论不存在', { commentId: id });
    }

    await this.commentRepository.updateStatus(id, status, transactionContext);

    const updated = await this.commentQueryService.getCommentById(id);
    if (!updated) {
      throw new DomainError(BLOG_ERROR.COMMENT_NOT_FOUND, '评论不存在', { commentId: id });
    }
    return updated;
  }
}
