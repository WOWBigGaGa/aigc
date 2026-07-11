import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '相邻文章' })
export class AdjacentArticleDTO {
  @Field(() => ID, { description: '文章 ID' })
  id!: string;

  @Field({ description: '文章标题' })
  title!: string;

  @Field({ description: '文章 slug' })
  slug!: string;
}

@ObjectType({ description: '相邻文章结果' })
export class AdjacentArticlesDTO {
  @Field(() => AdjacentArticleDTO, { nullable: true, description: '上一篇文章' })
  prev?: AdjacentArticleDTO;

  @Field(() => AdjacentArticleDTO, { nullable: true, description: '下一篇文章' })
  next?: AdjacentArticleDTO;
}
