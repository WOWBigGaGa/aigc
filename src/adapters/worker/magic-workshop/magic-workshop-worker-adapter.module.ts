import { Module } from '@nestjs/common';
import { MagicWorkshopModule } from '@src/modules/magic-workshop/magic-workshop.module';
import { CraftConsumer } from './craft.consumer';

@Module({
  imports: [MagicWorkshopModule],
  providers: [CraftConsumer],
})
export class MagicWorkshopWorkerAdapterModule {}
