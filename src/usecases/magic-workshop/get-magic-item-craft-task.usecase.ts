import { Injectable } from '@nestjs/common';
import { MagicWorkshopService } from '@src/modules/magic-workshop/magic-workshop.service';
import { MagicItemCraftTask } from '@src/modules/magic-workshop/magic-workshop.types';

export interface GetMagicItemCraftTaskParams {
  id: string;
}

@Injectable()
export class GetMagicItemCraftTaskUsecase {
  constructor(private readonly magicWorkshopService: MagicWorkshopService) {}

  async execute(params: GetMagicItemCraftTaskParams): Promise<MagicItemCraftTask | null> {
    const { id } = params;
    return await this.magicWorkshopService.getMagicItemCraftTaskById(id);
  }
}
