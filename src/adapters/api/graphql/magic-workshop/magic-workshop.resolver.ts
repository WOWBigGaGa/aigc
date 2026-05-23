import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ValidateInput } from '@adapters/api/graphql/common/validate-input.decorator';
import { CreateMagicItemCraftTaskUsecase } from '@src/usecases/magic-workshop/create-magic-item-craft-task.usecase';
import { GetAllMagicItemCraftTasksUsecase } from '@src/usecases/magic-workshop/get-all-magic-item-craft-tasks.usecase';
import { GetMagicItemCraftTaskUsecase } from '@src/usecases/magic-workshop/get-magic-item-craft-task.usecase';
import { CreateMagicItemCraftTaskInput } from './dto/create-magic-item-craft-task.input';
import { MagicItemCraftTaskDTO } from './dto/magic-item-craft-task.dto';

@Resolver()
export class MagicWorkshopResolver {
  constructor(
    private readonly createMagicItemCraftTaskUsecase: CreateMagicItemCraftTaskUsecase,
    private readonly getMagicItemCraftTaskUsecase: GetMagicItemCraftTaskUsecase,
    private readonly getAllMagicItemCraftTasksUsecase: GetAllMagicItemCraftTasksUsecase,
  ) {}

  @Mutation(() => MagicItemCraftTaskDTO, { description: '创建魔法道具制作任务' })
  @ValidateInput()
  async createMagicItemCraftTask(@Args('input') input: CreateMagicItemCraftTaskInput) {
    const result = await this.createMagicItemCraftTaskUsecase.execute({ input });
    return result.task;
  }

  @Query(() => MagicItemCraftTaskDTO, {
    nullable: true,
    description: '根据任务 ID 查询魔法道具制作任务',
  })
  async magicItemCraftTask(@Args('id') id: string) {
    return this.getMagicItemCraftTaskUsecase.execute({ id });
  }

  @Query(() => [MagicItemCraftTaskDTO], {
    description: '查询所有魔法道具制作任务',
  })
  async magicItemCraftTasks() {
    return this.getAllMagicItemCraftTasksUsecase.execute();
  }
}
