import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  MagicItemType,
  MagicItemCraftTaskStatus,
  MagicItemQualityLevel,
} from '../magic-workshop.types';

@Entity('magic_item_craft_tasks')
export class MagicItemCraftTaskEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '任务主键 UUID' })
  id!: string;

  @Column({ name: 'item_name', type: 'varchar', length: 128, comment: '道具名称' })
  itemName!: string;

  @Column({
    name: 'item_type',
    type: 'enum',
    enum: MagicItemType,
    comment: '道具类型',
  })
  itemType!: MagicItemType;

  @Column({
    name: 'material_level',
    type: 'tinyint',
    unsigned: true,
    comment: '材料等级，1-5',
  })
  materialLevel!: number;

  @Column({
    name: 'request_note',
    type: 'varchar',
    length: 512,
    nullable: true,
    comment: '用户提交的制作备注',
  })
  requestNote!: string | null;

  @Column({
    type: 'enum',
    enum: MagicItemCraftTaskStatus,
    default: MagicItemCraftTaskStatus.PENDING,
    comment: '当前任务状态',
  })
  status!: MagicItemCraftTaskStatus;

  @Column({
    name: 'quality_level',
    type: 'enum',
    enum: MagicItemQualityLevel,
    nullable: true,
    comment: '完成后的品质等级',
  })
  qualityLevel!: MagicItemQualityLevel | null;

  @Column({
    name: 'result_description',
    type: 'varchar',
    length: 1024,
    nullable: true,
    comment: '制作结果描述',
  })
  resultDescription!: string | null;

  @Column({
    name: 'failure_reason',
    type: 'varchar',
    length: 1024,
    nullable: true,
    comment: '制作失败原因',
  })
  failureReason!: string | null;

  @Column({
    name: 'craft_log',
    type: 'text',
    nullable: true,
    comment: '制作过程日志',
  })
  craftLog!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    comment: '创建时间（系统事件时间）',
  })
  createdAt!: Date;

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
