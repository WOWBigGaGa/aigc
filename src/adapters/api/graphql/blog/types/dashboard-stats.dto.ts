import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '仪表盘统计' })
export class DashboardStatsDTO {
  @Field(() => Number, { description: '文章总数' })
  articleCount!: number;

  @Field(() => Number, { description: '分类总数' })
  categoryCount!: number;

  @Field(() => Number, { description: '标签总数' })
  tagCount!: number;

  @Field(() => Number, { description: '评论总数' })
  commentCount!: number;

  @Field(() => Number, { description: '总阅读量' })
  totalViewCount!: number;

  @Field(() => Number, { description: '总点赞量' })
  totalLikeCount!: number;

  @Field(() => Number, { description: '待审核评论数' })
  pendingCommentCount!: number;
}
