import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { Inject, Injectable } from '@nestjs/common';
import { CategoryRepository } from '@src/modules/blog/repositories/category.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Category, CreateCategoryInput } from '@src/modules/blog/blog.types';

@Injectable()
export class CreateCategoryUsecase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    input,
    transactionContext,
  }: {
    input: CreateCategoryInput;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<Category> {
    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doCreate(activeTransactionContext, input);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private async doCreate(
    transactionContext: PersistenceTransactionContext,
    input: CreateCategoryInput,
  ): Promise<Category> {
    const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-');

    const existingBySlug = await this.categoryRepository.findBySlug(slug, transactionContext);
    if (existingBySlug) {
      throw new DomainError(BLOG_ERROR.CATEGORY_SLUG_EXISTS, '分类别名已存在', { slug });
    }

    return this.categoryRepository.create(
      {
        name: input.name,
        slug,
        description: input.description || null,
        parentId: input.parentId || null,
        sort: input.sort || 0,
      },
      transactionContext,
    );
  }
}
