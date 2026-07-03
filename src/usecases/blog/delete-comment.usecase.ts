import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '@src/modules/blog/repositories/comment.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';

@Injectable()
export class DeleteCommentUsecase {
  constructor(
    private readonly commentRepository: CommentRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    id,
    transactionContext,
  }: {
    id: string;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<void> {
    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doDelete(activeTransactionContext, id);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private async doDelete(
    transactionContext: PersistenceTransactionContext,
    id: string,
  ): Promise<void> {
    const comment = await this.commentRepository.findById(id, transactionContext);
    if (!comment) {
      throw new DomainError(BLOG_ERROR.COMMENT_NOT_FOUND, '评论不存在', { commentId: id });
    }

    await this.commentRepository.softDelete(id, transactionContext);
  }
}
