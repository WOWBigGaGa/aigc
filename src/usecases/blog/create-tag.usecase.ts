import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import type { UsecaseSession } from '@app-types/auth/session.types';
import { Inject, Injectable } from '@nestjs/common';
import { TagRepository } from '@src/modules/blog/repositories/tag.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError, PERMISSION_ERROR } from '@core/common/errors/domain-error';
import { canManageTag } from '@core/blog/policy/blog-authorization.policy';
import { Tag, CreateTagInput } from '@src/modules/blog/blog.types';
import { normalizeTagName, normalizeTagSlug } from './blog.input.normalize';

@Injectable()
export class CreateTagUsecase {
  constructor(
    private readonly tagRepository: TagRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    input,
    session,
    transactionContext,
  }: {
    input: CreateTagInput;
    session: UsecaseSession;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<Tag> {
    if (!canManageTag(session)) {
      throw new DomainError(PERMISSION_ERROR.ACCESS_DENIED, '无权限创建标签');
    }

    const normalizedInput = this.normalizeInput(input);

    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doCreate(activeTransactionContext, normalizedInput);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private normalizeInput(input: CreateTagInput): CreateTagInput {
    const name = normalizeTagName(input.name);
    const slug = input.slug
      ? normalizeTagSlug(input.slug)
      : name.toLowerCase().replace(/\s+/g, '-');

    return {
      name,
      slug,
    };
  }

  private async doCreate(
    transactionContext: PersistenceTransactionContext,
    input: CreateTagInput,
  ): Promise<Tag> {
    const name = input.name;
    const slug = input.slug!;

    const existingByName = await this.tagRepository.findByName(name, transactionContext);
    if (existingByName) {
      throw new DomainError(BLOG_ERROR.TAG_NAME_EXISTS, '标签名称已存在', { name });
    }

    const existingBySlug = await this.tagRepository.findBySlug(slug, transactionContext);
    if (existingBySlug) {
      throw new DomainError(BLOG_ERROR.TAG_SLUG_EXISTS, '标签别名已存在', { slug });
    }

    return this.tagRepository.create(
      {
        name,
        slug,
      },
      transactionContext,
    );
  }
}
