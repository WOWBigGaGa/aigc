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
import { Category, CreateCategoryInput } from '@src/modules/blog/blog.types';
import {
  normalizeCategoryName,
  normalizeCategorySlug,
  normalizeCategoryDescription,
} from './blog.input.normalize';

@Injectable()
export class CreateCategoryUsecase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    input,
    session,
    transactionContext,
  }: {
    input: CreateCategoryInput;
    session: UsecaseSession;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<Category> {
    if (!canManageCategory(session)) {
      throw new DomainError(PERMISSION_ERROR.ACCESS_DENIED, '无权限创建分类');
    }

    const normalizedInput = this.normalizeInput(input);

    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doCreate(activeTransactionContext, normalizedInput);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private normalizeInput(input: CreateCategoryInput): CreateCategoryInput {
    const name = normalizeCategoryName(input.name);
    const slug = input.slug
      ? normalizeCategorySlug(input.slug)
      : name.toLowerCase().replace(/\s+/g, '-');

    return {
      name,
      slug,
      description: normalizeCategoryDescription(input.description),
      parentId: input.parentId,
      sort: input.sort || 0,
    };
  }

  private async doCreate(
    transactionContext: PersistenceTransactionContext,
    input: CreateCategoryInput,
  ): Promise<Category> {
    const slug = input.slug!;
    const existingBySlug = await this.categoryRepository.findBySlug(slug, transactionContext);
    if (existingBySlug) {
      throw new DomainError(BLOG_ERROR.CATEGORY_SLUG_EXISTS, '分类别名已存在', {
        slug,
      });
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
