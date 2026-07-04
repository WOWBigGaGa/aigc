import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import type { UsecaseSession } from '@app-types/auth/session.types';
import { Inject, Injectable } from '@nestjs/common';
import { ArticleRepository } from '@src/modules/blog/repositories/article.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError, PERMISSION_ERROR } from '@core/common/errors/domain-error';
import { canManageArticle } from '@core/blog/policy/blog-authorization.policy';
import { normalizeArticleId } from './blog.input.normalize';

@Injectable()
export class DeleteArticleUsecase {
  constructor(
    private readonly articleRepository: ArticleRepository,
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
  }): Promise<void> {
    const normalizedId = normalizeArticleId(id);

    const run = async (activeTransactionContext: PersistenceTransactionContext) => {
      const article = await this.articleRepository.findById(normalizedId, activeTransactionContext);
      if (!article) {
        throw new DomainError(BLOG_ERROR.ARTICLE_NOT_FOUND, '文章不存在', {
          articleId: normalizedId,
        });
      }

      if (!canManageArticle(session, article.authorId)) {
        throw new DomainError(PERMISSION_ERROR.ACCESS_DENIED, '无权限删除文章');
      }

      await this.articleRepository.softDelete(normalizedId, activeTransactionContext);
    };

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }
}
