import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommentStatus } from '../blog.types';

@Entity('comment')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '评论主键 UUID' })
  id!: string;

  @Column({ name: 'article_id', type: 'char', length: 36, comment: '文章 ID' })
  articleId!: string;

  @Column({ name: 'author_name', type: 'varchar', length: 64, comment: '评论者名称' })
  authorName!: string;

  @Column({ name: 'author_email', type: 'varchar', length: 128, comment: '评论者邮箱' })
  authorEmail!: string;

  @Column({ name: 'author_avatar', type: 'varchar', length: 255, comment: '评论者头像 URL' })
  authorAvatar!: string;

  @Column({ name: 'content', type: 'text', comment: '评论内容' })
  content!: string;

  @Column({
    name: 'parent_id',
    type: 'char',
    length: 36,
    nullable: true,
    comment: '父评论 ID（楼中楼）',
  })
  parentId!: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.PENDING,
    comment: '评论状态：PENDING-待审核，APPROVED-已通过，REJECTED-已驳回，HIDDEN-已隐藏',
  })
  status!: CommentStatus;

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

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    precision: 3,
    nullable: true,
    comment: '删除时间（软删除）',
  })
  deletedAt!: Date | null;
}
