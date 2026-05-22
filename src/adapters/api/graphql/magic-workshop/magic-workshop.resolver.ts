import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ValidateInput } from '@adapters/api/graphql/common/validate-input.decorator';
import { CreateMagicItemCraftTaskInput } from '@src/modules/magic-workshop/dto/create-magic-item-craft-task.input';
import { MagicItemCraftTaskEntity } from '@src/modules/magic-workshop/entities/magic-item-craft-task.entity';
import { MagicWorkshopService } from '@src/modules/magic-workshop/magic-workshop.service';

@Resolver()
export class MagicWorkshopResolver {
  constructor(private readonly magicWorkshopService: MagicWorkshopService) {}

  @Mutation(() => MagicItemCraftTaskEntity, { description: '创建魔法道具制作任务' })
  @ValidateInput()
  async createMagicItemCraftTask(
    @Args('input') input: CreateMagicItemCraftTaskInput,
  ): Promise<MagicItemCraftTaskEntity> {
    return this.magicWorkshopService.createMagicItemCraftTask(input);
  }

  @Query(() => MagicItemCraftTaskEntity, {
    nullable: true,
    description: '根据任务 ID 查询魔法道具制作任务',
  })
  async magicItemCraftTask(@Args('id') id: string): Promise<MagicItemCraftTaskEntity | null> {
    return this.magicWorkshopService.getMagicItemCraftTaskById(id);
  }

  @Query(() => [MagicItemCraftTaskEntity], {
    description: '查询所有魔法道具制作任务',
  })
  async magicItemCraftTasks(): Promise<MagicItemCraftTaskEntity[]> {
    return this.magicWorkshopService.getAllMagicItemCraftTasks();
  }
}
