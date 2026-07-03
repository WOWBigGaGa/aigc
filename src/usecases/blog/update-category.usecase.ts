import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { Inject, Injectable } from '@nestjs/common';
import { CategoryRepository } from '@src/modules/blog/repositories/category.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Category, UpdateCategoryInput } from '@src/modules/blog/blog.types';

@Injectable()
export class UpdateCategoryUsecase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    id,
    input,
    transactionContext,
  }: {
    id: string;
    input: UpdateCategoryInput;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<Category> {
    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doUpdate(activeTransactionContext, id, input);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private async doUpdate(
    transactionContext: PersistenceTransactionContext,
    id: string,
    input: UpdateCategoryInput,
  ): Promise<Category> {
    const category = await this.categoryRepository.findById(id, transactionContext);
    if (!category) {
      throw new DomainError(BLOG_ERROR.CATEGORY_NOT_FOUND, '分类不存在', { categoryId: id });
    }

    if (input.slug) {
      const existingBySlug = await this.categoryRepository.findBySlug(
        input.slug,
        transactionContext,
      );
      if (existingBySlug && existingBySlug.id !== id) {
        throw new DomainError(BLOG_ERROR.CATEGORY_SLUG_EXISTS, '分类别名已存在', {
          slug: input.slug,
        });
      }
    }

    return this.categoryRepository.update(id, input, transactionContext);
  }
}
