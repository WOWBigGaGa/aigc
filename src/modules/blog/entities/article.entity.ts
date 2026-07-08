import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ArticleStatus } from '../blog.types';

@Entity('article')
export class ArticleEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '文章主键 UUID' })
  id!: string;

  @Column({ name: 'title', type: 'varchar', length: 255, comment: '文章标题' })
  title!: string;

  @Column({ name: 'slug', type: 'varchar', length: 255, comment: '文章 slug' })
  @Index({ unique: true })
  slug!: string;

  @Column({ name: 'content', type: 'longtext', comment: '文章内容（Markdown）' })
  content!: string;

  @Column({
    name: 'cover_image',
    type: 'varchar',
    length: 512,
    nullable: true,
    comment: '封面图片 URL',
  })
  coverImage!: string | null;

  @Column({ name: 'summary', type: 'varchar', length: 512, comment: '文章摘要' })
  summary!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
    comment: '文章状态：DRAFT-草稿，PUBLISHED-已发布，ARCHIVED-已归档',
  })
  @Index()
  status!: ArticleStatus;

  @Column({
    name: 'category_id',
    type: 'char',
    length: 36,
    nullable: true,
    comment: '分类 ID',
  })
  @Index()
  categoryId!: string | null;

  @Column({ name: 'author_id', type: 'char', length: 36, comment: '作者 ID' })
  @Index()
  authorId!: string;

  @Column({
    name: 'view_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '阅读次数',
  })
  viewCount!: number;

  @Column({
    name: 'like_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '点赞次数',
  })
  likeCount!: number;

  @Column({ name: 'is_pinned', type: 'tinyint', default: 0, comment: '是否置顶' })
  @Index()
  isPinned!: boolean;

  @Column({
    name: 'published_at',
    type: 'timestamp',
    precision: 3,
    nullable: true,
    comment: '发布时间',
  })
  @Index()
  publishedAt!: Date | null;

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
