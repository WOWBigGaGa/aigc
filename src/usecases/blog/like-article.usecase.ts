import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import type { UsecaseSession } from '@app-types/auth/session.types';
import { Inject, Injectable } from '@nestjs/common';
import { ArticleRepository } from '@src/modules/blog/repositories/article.repository';
import { ArticleLikeRepository } from '@src/modules/blog/repositories/article-like.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { ArticleView } from '@src/modules/blog/blog.types';
import { normalizeArticleId } from './blog.input.normalize';

@Injectable()
export class LikeArticleUsecase {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleLikeRepository: ArticleLikeRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    id,
    session,
    ipAddress,
    transactionContext,
  }: {
    id: string;
    session?: UsecaseSession;
    ipAddress?: string;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<ArticleView> {
    const normalizedId = normalizeArticleId(id);

    const run = async (activeTransactionContext: PersistenceTransactionContext) => {
      const existingLike = session && session.accountId
        ? await this.articleLikeRepository.findByArticleAndUser(
            normalizedId,
            String(session.accountId),
            activeTransactionContext,
          )
        : ipAddress
        ? await this.articleLikeRepository.findByArticleAndIp(
            normalizedId,
            ipAddress,
            activeTransactionContext,
          )
        : null;

      if (existingLike) {
        throw new DomainError(BLOG_ERROR.UPDATE_FAILED, '您已经点赞过这篇文章了');
      }

      await this.articleRepository.incrementLikeCount(
        normalizedId,
        activeTransactionContext,
      );

      await this.articleLikeRepository.create(
        {
          articleId: normalizedId,
          userId: session?.accountId ? String(session.accountId) : null,
          ipAddress,
        },
        activeTransactionContext,
      );

      const article = await this.articleRepository.findById(
        normalizedId,
        activeTransactionContext,
      );

      if (!article) {
        throw new DomainError(BLOG_ERROR.NOT_FOUND, '文章不存在');
      }

      return {
        id: article.id,
        title: article.title,
        content: article.content,
        coverImage: article.coverImage,
        summary: article.summary,
        status: article.status,
        categoryId: article.categoryId,
        authorId: article.authorId,
        viewCount: article.viewCount,
        likeCount: article.likeCount,
        isPinned: article.isPinned,
        publishedAt: article.publishedAt,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      };
    };

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }
}
