import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '@src/modules/blog/repositories/comment.repository';
import { CommentQueryService } from '@src/modules/blog/queries/comment.query.service';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { CommentStatus, CommentView, CreateCommentInput } from '@src/modules/blog/blog.types';

@Injectable()
export class CreateCommentUsecase {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentQueryService: CommentQueryService,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    input,
    transactionContext,
  }: {
    input: CreateCommentInput;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<CommentView> {
    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doCreate(activeTransactionContext, input);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private async doCreate(
    transactionContext: PersistenceTransactionContext,
    input: CreateCommentInput,
  ): Promise<CommentView> {
    const comment = await this.commentRepository.create(
      {
        articleId: input.articleId,
        authorName: input.authorName,
        authorEmail: input.authorEmail,
        content: input.content,
        parentId: input.parentId || null,
        status: CommentStatus.PENDING,
        authorAvatar: '',
      },
      transactionContext,
    );

    const created = await this.commentQueryService.getCommentById(comment.id);
    if (!created) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '创建评论失败');
    }
    return created;
  }
}
