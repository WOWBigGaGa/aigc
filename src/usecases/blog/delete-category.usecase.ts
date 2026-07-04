import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import type { UsecaseSession } from '@app-types/auth/session.types';
import { Inject, Injectable } from '@nestjs/common';
import { CategoryRepository } from '@src/modules/blog/repositories/category.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError, PERMISSION_ERROR } from '@core/common/errors/domain-error';
import { canManageCategory } from '@core/blog/policy/blog-authorization.policy';
import { normalizeCategoryId } from './blog.input.normalize';

@Injectable()
export class DeleteCategoryUsecase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
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
    if (!canManageCategory(session)) {
      throw new DomainError(PERMISSION_ERROR.ACCESS_DENIED, '无权限删除分类');
    }

    const normalizedId = normalizeCategoryId(id);

    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doDelete(activeTransactionContext, normalizedId);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private async doDelete(
    transactionContext: PersistenceTransactionContext,
    id: string,
  ): Promise<void> {
    const category = await this.categoryRepository.findById(id, transactionContext);
    if (!category) {
      throw new DomainError(BLOG_ERROR.CATEGORY_NOT_FOUND, '分类不存在', { categoryId: id });
    }

    await this.categoryRepository.delete(id, transactionContext);
  }
}
