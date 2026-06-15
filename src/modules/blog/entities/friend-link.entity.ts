import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('friend_link')
export class FriendLinkEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '友链主键 UUID' })
  id!: string;

  @Column({ name: 'name', type: 'varchar', length: 64, comment: '友链名称' })
  name!: string;

  @Column({ name: 'url', type: 'varchar', length: 255, comment: '友链 URL' })
  url!: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '友链描述',
  })
  description!: string | null;

  @Column({
    name: 'logo',
    type: 'varchar',
    length: 512,
    nullable: true,
    comment: '友链 Logo URL',
  })
  logo!: string | null;

  @Column({ name: 'sort', type: 'int', default: 0, comment: '排序顺序' })
  sort!: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否启用' })
  isActive!: boolean;

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
