import { Injectable } from '@nestjs/common';
import { MagicWorkshopService } from '@src/modules/magic-workshop/magic-workshop.service';
import {
  CreateMagicItemCraftTaskInput,
  MagicItemCraftTask,
} from '@src/modules/magic-workshop/magic-workshop.types';

export interface CreateMagicItemCraftTaskParams {
  input: CreateMagicItemCraftTaskInput;
}

export interface CreateMagicItemCraftTaskResult {
  task: MagicItemCraftTask;
}

@Injectable()
export class CreateMagicItemCraftTaskUsecase {
  constructor(private readonly magicWorkshopService: MagicWorkshopService) {}

  async execute(params: CreateMagicItemCraftTaskParams): Promise<CreateMagicItemCraftTaskResult> {
    const { input } = params;
    const task = await this.magicWorkshopService.createMagicItemCraftTask(input);
    return { task };
  }
}
