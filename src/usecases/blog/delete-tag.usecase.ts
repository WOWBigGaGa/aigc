import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { Inject, Injectable } from '@nestjs/common';
import { TagRepository } from '@src/modules/blog/repositories/tag.repository';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BLOG_ERROR, DomainError } from '@core/common/errors/domain-error';

@Injectable()
export class DeleteTagUsecase {
  constructor(
    private readonly tagRepository: TagRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute({
    id,
    transactionContext,
  }: {
    id: string;
    transactionContext?: PersistenceTransactionContext;
  }): Promise<void> {
    const run = async (activeTransactionContext: PersistenceTransactionContext) =>
      this.doDelete(activeTransactionContext, id);

    return transactionContext
      ? await run(transactionContext)
      : await this.transactionRunner.run(run);
  }

  private async doDelete(
    transactionContext: PersistenceTransactionContext,
    id: string,
  ): Promise<void> {
    const tag = await this.tagRepository.findById(id, transactionContext);
    if (!tag) {
      throw new DomainError(BLOG_ERROR.TAG_NOT_FOUND, '标签不存在', { tagId: id });
    }

    await this.tagRepository.delete(id, transactionContext);
  }
}
