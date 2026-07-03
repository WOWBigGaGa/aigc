import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { Inject, Injectable } from '@nestjs/common';
import { TagRepository } from '@src/modules/blog/repositories/tag.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';
import { Tag, UpdateTagInput } from '@src/modules/blog/blog.types';

@Injectable()
export class UpdateTagUsecase {
  constructor(
    private readonly tagRepository: TagRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    id,
    input,
    transactionContext,
  }: {
    id: string;
    input: UpdateTagInput;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<Tag> {
    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doUpdate(activeTransactionContext, id, input);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private async doUpdate(
    transactionContext: PersistenceTransactionContext,
    id: string,
    input: UpdateTagInput,
  ): Promise<Tag> {
    const tag = await this.tagRepository.findById(id, transactionContext);
    if (!tag) {
      throw new DomainError(BLOG_ERROR.TAG_NOT_FOUND, '标签不存在', { tagId: id });
    }

    if (input.name) {
      const existingByName = await this.tagRepository.findByName(input.name, transactionContext);
      if (existingByName && existingByName.id !== id) {
        throw new DomainError(BLOG_ERROR.TAG_NAME_EXISTS, '标签名称已存在', { name: input.name });
      }
    }

    if (input.slug) {
      const existingBySlug = await this.tagRepository.findBySlug(input.slug, transactionContext);
      if (existingBySlug && existingBySlug.id !== id) {
        throw new DomainError(BLOG_ERROR.TAG_SLUG_EXISTS, '标签别名已存在', { slug: input.slug });
      }
    }

    return this.tagRepository.update(id, input, transactionContext);
  }
}
