import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullMqModule } from '@src/infrastructure/bullmq/bullmq.module';
import { MagicItemCraftTaskEntity } from './entities/magic-item-craft-task.entity';
import { MagicWorkshopService } from './magic-workshop.service';

@Module({
  imports: [TypeOrmModule.forFeature([MagicItemCraftTaskEntity]), BullMqModule],
  providers: [MagicWorkshopService],
  exports: [TypeOrmModule, MagicWorkshopService],
})
export class MagicWorkshopModule {}
