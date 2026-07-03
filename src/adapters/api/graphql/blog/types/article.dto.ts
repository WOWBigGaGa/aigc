import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ArticleStatus } from '@src/modules/blog/blog.types';

@ObjectType({ description: '文章' })
export class ArticleDTO {
  @Field(() => ID, { description: '文章 ID' })
  id!: string;

  @Field({ description: '文章标题' })
  title!: string;

  @Field({ description: '文章内容' })
  content!: string;

  @Field(() => String, { nullable: true, description: '封面图片 URL' })
  coverImage!: string | null;

  @Field({ description: '文章摘要' })
  summary!: string;

  @Field(() => ArticleStatus, { description: '文章状态' })
  status!: ArticleStatus;

  @Field(() => String, { nullable: true, description: '分类 ID' })
  categoryId!: string | null;

  @Field({ description: '作者 ID' })
  authorId!: string;

  @Field(() => Number, { description: '阅读次数' })
  viewCount!: number;

  @Field(() => Number, { description: '点赞次数' })
  likeCount!: number;

  @Field(() => Boolean, { description: '是否置顶' })
  isPinned!: boolean;

  @Field(() => Date, { nullable: true, description: '发布时间' })
  publishedAt!: Date | null;

  @Field(() => Date, { description: '创建时间' })
  createdAt!: Date;

  @Field(() => Date, { description: '更新时间' })
  updatedAt!: Date;
}
