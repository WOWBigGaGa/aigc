import { Field, InputType } from '@nestjs/graphql';
import { ArticleStatus } from '@src/modules/blog/blog.types';
import { IsEnum, IsOptional } from 'class-validator';

@InputType({ description: '文章筛选输入' })
export class ArticleFilterInput {
  @Field(() => ArticleStatus, { nullable: true, description: '文章状态' })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @Field(() => String, { nullable: true, description: '分类 ID' })
  @IsOptional()
  categoryId?: string;

  @Field(() => [String], { nullable: true, description: '标签 ID 列表' })
  @IsOptional()
  tagIds?: string[];

  @Field(() => String, { nullable: true, description: '搜索关键词' })
  @IsOptional()
  keyword?: string;

  @Field(() => Boolean, { nullable: true, description: '是否置顶' })
  @IsOptional()
  isPinned?: boolean;
}
