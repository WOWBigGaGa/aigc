import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  MagicItemType,
  MagicItemCraftTaskStatus,
  MagicItemQualityLevel,
} from '@src/modules/magic-workshop/magic-workshop.types';

@ObjectType({ description: '魔法道具制作任务' })
export class MagicItemCraftTaskDTO {
  @Field(() => ID, { description: '任务 ID' })
  id!: string;

  @Field({ description: '道具名称' })
  itemName!: string;

  @Field(() => MagicItemType, { description: '道具类型' })
  itemType!: MagicItemType;

  @Field(() => Number, { description: '材料等级（1-5）' })
  materialLevel!: number;

  @Field(() => String, { nullable: true, description: '制作请求备注' })
  requestNote!: string | null;

  @Field(() => MagicItemCraftTaskStatus, { description: '任务状态' })
  status!: MagicItemCraftTaskStatus;

  @Field(() => MagicItemQualityLevel, { nullable: true, description: '品质等级' })
  qualityLevel!: MagicItemQualityLevel | null;

  @Field(() => String, { nullable: true, description: '结果描述' })
  resultDescription!: string | null;

  @Field(() => String, { nullable: true, description: '失败原因' })
  failureReason!: string | null;

  @Field(() => String, { nullable: true, description: '制作日志' })
  craftLog!: string | null;

  @Field(() => Date, { description: '创建时间' })
  createdAt!: Date;

  @Field(() => Date, { description: '更新时间' })
  updatedAt!: Date;
}
