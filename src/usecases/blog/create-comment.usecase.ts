import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import type { UsecaseSession } from '@app-types/auth/session.types';
import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { CommentRepository } from '@src/modules/blog/repositories/comment.repository';
import { CommentQueryService } from '@src/modules/blog/queries/comment.query.service';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError, PERMISSION_ERROR } from '@core/common/errors/domain-error';
import { canCreateComment } from '@core/blog/policy/blog-authorization.policy';
import { CommentStatus, CommentView, CreateCommentInput } from '@src/modules/blog/blog.types';
import {
  normalizeCommentContent,
  normalizeArticleId,
  normalizeCommentAuthorName,
  normalizeCommentAuthorEmail,
  normalizeEmailForAvatar,
} from './blog.input.normalize';

const MAX_COMMENT_DEPTH = 3;

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
    session,
    transactionContext,
  }: {
    input: CreateCommentInput;
    session: UsecaseSession;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<CommentView> {
    if (!canCreateComment(session)) {
      throw new DomainError(PERMISSION_ERROR.ACCESS_DENIED, '无权限创建评论');
    }

    const normalizedInput = this.normalizeInput(input);

    const run = async (activeTransactionContext: PersistenceTransactionContext) => {
      if (normalizedInput.parentId) {
        await this.validateCommentDepth(normalizedInput.parentId, activeTransactionContext);
      }

      return this.doCreate(activeTransactionContext, normalizedInput);
    };

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private normalizeInput(input: CreateCommentInput): CreateCommentInput {
    return {
      articleId: normalizeArticleId(input.articleId),
      authorName: normalizeCommentAuthorName(input.authorName),
      authorEmail: normalizeCommentAuthorEmail(input.authorEmail),
      content: normalizeCommentContent(input.content),
      parentId: input.parentId,
    };
  }

  private async validateCommentDepth(
    parentId: string,
    transactionContext: PersistenceTransactionContext,
  ): Promise<void> {
    const depth = await this.commentRepository.getCommentDepth(parentId, transactionContext);
    if (depth >= MAX_COMMENT_DEPTH) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, `评论层级不能超过 ${MAX_COMMENT_DEPTH} 层`);
    }
  }

  private generateAvatar(email: string): string {
    const normalizedEmail = normalizeEmailForAvatar(email);
    const hash = createHash('md5').update(normalizedEmail).digest('hex');
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
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
        authorAvatar: this.generateAvatar(input.authorEmail),
      },
      transactionContext,
    );

    const created = await this.commentQueryService.getCommentById(comment.id, transactionContext);
    if (!created) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '创建评论失败');
    }
    return created;
  }
}
