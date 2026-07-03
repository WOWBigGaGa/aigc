import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { Inject, Injectable } from '@nestjs/common';
import { TagRepository } from '@src/modules/blog/repositories/tag.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Tag, CreateTagInput } from '@src/modules/blog/blog.types';

@Injectable()
export class CreateTagUsecase {
  constructor(
    private readonly tagRepository: TagRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    input,
    transactionContext,
  }: {
    input: CreateTagInput;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<Tag> {
    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doCreate(activeTransactionContext, input);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private async doCreate(
    transactionContext: PersistenceTransactionContext,
    input: CreateTagInput,
  ): Promise<Tag> {
    const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-');

    const existingByName = await this.tagRepository.findByName(input.name, transactionContext);
    if (existingByName) {
      throw new DomainError(BLOG_ERROR.TAG_NAME_EXISTS, '标签名称已存在', { name: input.name });
    }

    const existingBySlug = await this.tagRepository.findBySlug(slug, transactionContext);
    if (existingBySlug) {
      throw new DomainError(BLOG_ERROR.TAG_SLUG_EXISTS, '标签别名已存在', { slug });
    }

    return this.tagRepository.create(
      {
        name: input.name,
        slug,
      },
      transactionContext,
    );
  }
}
