import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CommentStatus } from '@src/modules/blog/blog.types';

@ObjectType({ description: '评论' })
export class CommentDTO {
  @Field(() => ID, { description: '评论 ID' })
  id!: string;

  @Field({ description: '文章 ID' })
  articleId!: string;

  @Field({ description: '评论作者名称' })
  authorName!: string;

  @Field({ description: '评论作者邮箱' })
  authorEmail!: string;

  @Field({ description: '评论作者头像' })
  authorAvatar!: string;

  @Field({ description: '评论内容' })
  content!: string;

  @Field(() => String, { nullable: true, description: '父评论 ID（楼中楼）' })
  parentId!: string | null;

  @Field(() => CommentStatus, { description: '评论状态' })
  status!: CommentStatus;

  @Field(() => Date, { description: '创建时间' })
  createdAt!: Date;

  @Field(() => Date, { description: '更新时间' })
  updatedAt!: Date;
}
