import { Injectable } from '@nestjs/common';
import { MagicWorkshopService } from '@src/modules/magic-workshop/magic-workshop.service';
import { MagicItemCraftTask } from '@src/modules/magic-workshop/magic-workshop.types';

@Injectable()
export class GetAllMagicItemCraftTasksUsecase {
  constructor(private readonly magicWorkshopService: MagicWorkshopService) {}

  async execute(): Promise<MagicItemCraftTask[]> {
    return await this.magicWorkshopService.getAllMagicItemCraftTasks();
  }
}
