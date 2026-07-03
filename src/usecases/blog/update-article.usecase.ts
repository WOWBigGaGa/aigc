import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { Inject, Injectable } from '@nestjs/common';
import { ArticleRepository } from '@src/modules/blog/repositories/article.repository';
import { TagRepository } from '@src/modules/blog/repositories/tag.repository';
import { ArticleQueryService } from '@src/modules/blog/queries/article.query.service';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import {
  ArticleStatus,
  ArticleUpdateData,
  ArticleView,
  UpdateArticleInput,
} from '@src/modules/blog/blog.types';

@Injectable()
export class UpdateArticleUsecase {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly tagRepository: TagRepository,
    private readonly articleQueryService: ArticleQueryService,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    id,
    input,
    transactionContext,
  }: {
    id: string;
    input: UpdateArticleInput;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<ArticleView> {
    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doUpdate(activeTransactionContext, id, input);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private async doUpdate(
    transactionContext: PersistenceTransactionContext,
    id: string,
    input: UpdateArticleInput,
  ): Promise<ArticleView> {
    const article = await this.articleRepository.findById(id, transactionContext);
    if (!article) {
      throw new DomainError(BLOG_ERROR.ARTICLE_NOT_FOUND, '文章不存在', { articleId: id });
    }

    const updateData: ArticleUpdateData = { ...input };

    if (input.status === ArticleStatus.PUBLISHED && !article.publishedAt) {
      updateData.publishedAt = new Date();
    }

    await this.articleRepository.update(id, updateData, transactionContext);

    const updated = await this.articleQueryService.getArticleById(id);
    if (!updated) {
      throw new DomainError(BLOG_ERROR.ARTICLE_NOT_FOUND, '文章不存在', { articleId: id });
    }
    return updated;
  }
}
