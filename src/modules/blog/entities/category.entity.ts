import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('category')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '分类主键 UUID' })
  id!: string;

  @Column({ name: 'name', type: 'varchar', length: 64, comment: '分类名称' })
  @Index({ unique: true })
  name!: string;

  @Column({ name: 'slug', type: 'varchar', length: 64, comment: '分类别名' })
  @Index({ unique: true })
  slug!: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '分类描述',
  })
  description!: string | null;

  @Column({
    name: 'parent_id',
    type: 'char',
    length: 36,
    nullable: true,
    comment: '父分类 ID（支持树形结构）',
  })
  @Index()
  parentId!: string | null;

  @Column({ name: 'sort', type: 'int', default: 0, comment: '排序顺序' })
  sort!: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    comment: '创建时间',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    comment: '更新时间',
  })
  updatedAt!: Date;
}
