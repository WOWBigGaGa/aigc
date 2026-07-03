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
import { ArticleStatus, ArticleView, CreateArticleInput } from '@src/modules/blog/blog.types';

@Injectable()
export class CreateArticleUsecase {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly tagRepository: TagRepository,
    private readonly articleQueryService: ArticleQueryService,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    input,
    authorId,
    transactionContext,
  }: {
    input: CreateArticleInput;
    authorId: string;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<ArticleView> {
    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doCreate(activeTransactionContext, input, authorId);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
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

    const created = await this.articleQueryService.getArticleById(article.id);
    if (!created) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '创建文章失败');
    }
    return created;
  }
}
