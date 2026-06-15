import { Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('article_tag')
@Index(['articleId', 'tagId'], { unique: true })
export class ArticleTagEntity {
  @PrimaryColumn({ name: 'article_id', type: 'char', length: 36 })
  articleId!: string;

  @PrimaryColumn({ name: 'tag_id', type: 'char', length: 36 })
  tagId!: string;
}
