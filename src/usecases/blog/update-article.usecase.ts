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
import {
  ArticleStatus,
  ArticleUpdateData,
  ArticleView,
  UpdateArticleInput,
} from '@src/modules/blog/blog.types';
import {
  normalizeArticleId,
  normalizeArticleTitle,
  normalizeArticleContent,
  normalizeArticleSummary,
  normalizeArticleCoverImage,
  normalizeArticleIsPinned,
  normalizeArticleStatus,
} from './blog.input.normalize';

@Injectable()
export class UpdateArticleUsecase {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleQueryService: ArticleQueryService,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    id,
    input,
    session,
    transactionContext,
  }: {
    id: string;
    input: UpdateArticleInput;
    session: UsecaseSession;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<ArticleView> {
    const normalizedId = normalizeArticleId(id);
    const normalizedInput = this.normalizeInput(input);

    const run = async (activeTransactionContext: PersistenceTransactionContext) => {
      const article = await this.articleRepository.findById(normalizedId, activeTransactionContext);
      if (!article) {
        throw new DomainError(BLOG_ERROR.ARTICLE_NOT_FOUND, '文章不存在', {
          articleId: normalizedId,
        });
      }

      if (!canManageArticle(session, article.authorId)) {
        throw new DomainError(PERMISSION_ERROR.ACCESS_DENIED, '无权限更新文章');
      }

      return this.doUpdate(activeTransactionContext, normalizedId, normalizedInput, article);
    };

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private normalizeInput(input: UpdateArticleInput): UpdateArticleInput {
    const normalized: UpdateArticleInput = {};
    if (input.title !== undefined) {
      normalized.title = normalizeArticleTitle(input.title);
    }
    if (input.content !== undefined) {
      normalized.content = normalizeArticleContent(input.content);
    }
    if (input.summary !== undefined) {
      normalized.summary = normalizeArticleSummary(input.summary);
    }
    if (input.coverImage !== undefined) {
      normalized.coverImage = normalizeArticleCoverImage(input.coverImage);
    }
    if (input.categoryId !== undefined) {
      normalized.categoryId = input.categoryId || null;
    }
    if (input.isPinned !== undefined) {
      normalized.isPinned = normalizeArticleIsPinned(input.isPinned);
    }
    if (input.status !== undefined) {
      normalized.status = normalizeArticleStatus(input.status);
    }
    return normalized;
  }

  private async doUpdate(
    transactionContext: PersistenceTransactionContext,
    id: string,
    input: UpdateArticleInput,
    article: { authorId: string; publishedAt: Date | null },
  ): Promise<ArticleView> {
    const updateData: ArticleUpdateData = { ...input };

    if (input.status === ArticleStatus.PUBLISHED && !article.publishedAt) {
      updateData.publishedAt = new Date();
    }

    await this.articleRepository.update(id, updateData, transactionContext);

    const updated = await this.articleQueryService.getArticleById(id, transactionContext);
    if (!updated) {
      throw new DomainError(BLOG_ERROR.ARTICLE_NOT_FOUND, '文章不存在', { articleId: id });
    }
    return updated;
  }
}
