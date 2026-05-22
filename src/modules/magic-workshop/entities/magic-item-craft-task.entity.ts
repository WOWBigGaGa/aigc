import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum MagicItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  TOOL = 'TOOL',
  TOY = 'TOY',
}

export enum MagicItemCraftTaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export enum MagicItemQualityLevel {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

@Entity('magic_item_craft_tasks')
@ObjectType({ description: '魔法道具制作任务实体' })
export class MagicItemCraftTaskEntity {
  @Field(() => ID, { description: '任务 ID' })
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '任务主键 UUID' })
  id!: string;

  @Field({ description: '道具名称' })
  @Column({ name: 'item_name', type: 'varchar', length: 128, comment: '道具名称' })
  itemName!: string;

  @Field(() => MagicItemType, { description: '道具类型' })
  @Column({
    name: 'item_type',
    type: 'enum',
    enum: MagicItemType,
    comment: '道具类型',
  })
  itemType!: MagicItemType;

  @Field(() => Number, { description: '材料等级（1-5）' })
  @Column({
    name: 'material_level',
    type: 'tinyint',
    unsigned: true,
    comment: '材料等级，1-5',
  })
  materialLevel!: number;

  @Field(() => String, { nullable: true, description: '制作请求备注' })
  @Column({
    name: 'request_note',
    type: 'varchar',
    length: 512,
    nullable: true,
    comment: '用户提交的制作备注',
  })
  requestNote!: string | null;

  @Field(() => MagicItemCraftTaskStatus, { description: '任务状态' })
  @Column({
    type: 'enum',
    enum: MagicItemCraftTaskStatus,
    default: MagicItemCraftTaskStatus.PENDING,
    comment: '当前任务状态',
  })
  status!: MagicItemCraftTaskStatus;

  @Field(() => MagicItemQualityLevel, { nullable: true, description: '品质等级' })
  @Column({
    name: 'quality_level',
    type: 'enum',
    enum: MagicItemQualityLevel,
    nullable: true,
    comment: '完成后的品质等级',
  })
  qualityLevel!: MagicItemQualityLevel | null;

  @Field(() => String, { nullable: true, description: '结果描述' })
  @Column({
    name: 'result_description',
    type: 'varchar',
    length: 1024,
    nullable: true,
    comment: '制作结果描述',
  })
  resultDescription!: string | null;

  @Field(() => String, { nullable: true, description: '失败原因' })
  @Column({
    name: 'failure_reason',
    type: 'varchar',
    length: 1024,
    nullable: true,
    comment: '制作失败原因',
  })
  failureReason!: string | null;

  @Field(() => String, { nullable: true, description: '制作日志' })
  @Column({
    name: 'craft_log',
    type: 'text',
    nullable: true,
    comment: '制作过程日志',
  })
  craftLog!: string | null;

  @Field(() => Date, { description: '创建时间' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    comment: '创建时间（系统事件时间）',
  })
  createdAt!: Date;

  @Field(() => Date, { description: '更新时间' })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    comment: '更新时间（系统事件时间）',
  })
  updatedAt!: Date;
}
