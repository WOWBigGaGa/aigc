import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('article_like')
export class ArticleLikeEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '点赞记录主键 UUID' })
  id!: string;

  @Column({ name: 'article_id', type: 'char', length: 36, comment: '文章 ID' })
  @Index()
  articleId!: string;

  @Column({ name: 'user_id', type: 'char', length: 36, nullable: true, comment: '用户 ID（登录用户）' })
  @Index()
  userId!: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true, comment: 'IP 地址（匿名用户）' })
  @Index()
  ipAddress!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    comment: '创建时间',
  })
  createdAt!: Date;
}
