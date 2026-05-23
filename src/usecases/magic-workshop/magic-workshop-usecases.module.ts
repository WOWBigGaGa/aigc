import { Module } from '@nestjs/common';
import { MagicWorkshopModule } from '@src/modules/magic-workshop/magic-workshop.module';
import { CreateMagicItemCraftTaskUsecase } from '@src/usecases/magic-workshop/create-magic-item-craft-task.usecase';
import { GetAllMagicItemCraftTasksUsecase } from '@src/usecases/magic-workshop/get-all-magic-item-craft-tasks.usecase';
import { GetMagicItemCraftTaskUsecase } from '@src/usecases/magic-workshop/get-magic-item-craft-task.usecase';

@Module({
  imports: [MagicWorkshopModule],
  providers: [
    CreateMagicItemCraftTaskUsecase,
    GetMagicItemCraftTaskUsecase,
    GetAllMagicItemCraftTasksUsecase,
  ],
  exports: [
    CreateMagicItemCraftTaskUsecase,
    GetMagicItemCraftTaskUsecase,
    GetAllMagicItemCraftTasksUsecase,
  ],
})
export class MagicWorkshopUsecasesModule {}
