import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { Inject, Injectable } from '@nestjs/common';
import { ArticleRepository } from '@src/modules/blog/repositories/article.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';

@Injectable()
export class DeleteArticleUsecase {
  constructor(
    private readonly articleRepository: ArticleRepository,
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
    const article = await this.articleRepository.findById(id, transactionContext);
    if (!article) {
      throw new DomainError(BLOG_ERROR.ARTICLE_NOT_FOUND, '文章不存在', { articleId: id });
    }

    await this.articleRepository.softDelete(id, transactionContext);
  }
}
