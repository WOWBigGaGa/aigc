import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import type { UsecaseSession } from '@app-types/auth/session.types';
import { Inject, Injectable } from '@nestjs/common';
import { ArticleRepository } from '@src/modules/blog/repositories/article.repository';
import { ArticleQueryService } from '@src/modules/blog/queries/article.query.service';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError, PERMISSION_ERROR } from '@core/common/errors/domain-error';
import { canManageArticle } from '@core/blog/policy/blog-authorization.policy';
import { ArticleStatus, ArticleView, CreateArticleInput } from '@src/modules/blog/blog.types';
import {
  normalizeArticleTitle,
  normalizeArticleContent,
  normalizeArticleSummary,
  normalizeArticleCoverImage,
  normalizeArticleIsPinned,
  normalizeAuthorId,
} from './blog.input.normalize';

@Injectable()
export class CreateArticleUsecase {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleQueryService: ArticleQueryService,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    input,
    authorId,
    session,
    transactionContext,
  }: {
    input: CreateArticleInput;
    authorId: string;
    session: UsecaseSession;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<ArticleView> {
    const normalizedAuthorId = normalizeAuthorId(authorId);

    if (!canManageArticle(session, normalizedAuthorId)) {
      throw new DomainError(PERMISSION_ERROR.ACCESS_DENIED, '无权限创建文章');
    }

    const normalizedInput = this.normalizeInput(input);

    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doCreate(activeTransactionContext, normalizedInput, normalizedAuthorId);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private normalizeInput(input: CreateArticleInput): CreateArticleInput {
    return {
      title: normalizeArticleTitle(input.title),
      content: normalizeArticleContent(input.content),
      summary: normalizeArticleSummary(input.summary),
      coverImage: normalizeArticleCoverImage(input.coverImage),
      categoryId: input.categoryId,
      isPinned: normalizeArticleIsPinned(input.isPinned),
    };
  }

  private async doCreate(
    transactionContext: PersistenceTransactionContext,
    input: CreateArticleInput,
    authorId: string,
  ): Promise<ArticleView> {
    const article = await this.articleRepository.create(
      {
        title: input.title,
        content: input.content,
        coverImage: input.coverImage || null,
        summary: input.summary,
        categoryId: input.categoryId || null,
        authorId,
        viewCount: 0,
        likeCount: 0,
        isPinned: input.isPinned || false,
        status: ArticleStatus.DRAFT,
        publishedAt: null,
      },
      transactionContext,
    );

    const created = await this.articleQueryService.getArticleById(article.id, transactionContext);
    if (!created) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '创建文章失败');
    }
    return created;
  }
}
