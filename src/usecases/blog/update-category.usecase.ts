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
import { Category, UpdateCategoryInput } from '@src/modules/blog/blog.types';
import {
  normalizeCategoryId,
  normalizeCategoryName,
  normalizeCategorySlug,
  normalizeCategoryDescription,
} from './blog.input.normalize';

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
    session,
    transactionContext,
  }: {
    id: string;
    input: UpdateCategoryInput;
    session: UsecaseSession;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<Category> {
    if (!canManageCategory(session)) {
      throw new DomainError(PERMISSION_ERROR.ACCESS_DENIED, '无权限更新分类');
    }

    const normalizedId = normalizeCategoryId(id);
    const normalizedInput = this.normalizeInput(input);

    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doUpdate(activeTransactionContext, normalizedId, normalizedInput);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private normalizeInput(input: UpdateCategoryInput): UpdateCategoryInput {
    const normalized: UpdateCategoryInput = {};
    if (input.name !== undefined) {
      normalized.name = normalizeCategoryName(input.name);
    }
    if (input.slug !== undefined) {
      normalized.slug = normalizeCategorySlug(input.slug);
    }
    if (input.description !== undefined) {
      normalized.description = normalizeCategoryDescription(input.description);
    }
    if (input.parentId !== undefined) {
      normalized.parentId = input.parentId || null;
    }
    if (input.sort !== undefined) {
      normalized.sort = input.sort;
    }
    return normalized;
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
