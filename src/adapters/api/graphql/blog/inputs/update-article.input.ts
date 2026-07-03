import { Field, InputType } from '@nestjs/graphql';
import { ArticleStatus } from '@src/modules/blog/blog.types';
import { IsEnum, IsOptional, MaxLength } from 'class-validator';

@InputType({ description: '更新文章输入' })
export class UpdateArticleInput {
  @Field(() => String, { nullable: true, description: '文章标题' })
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @Field(() => String, { nullable: true, description: '文章内容' })
  @IsOptional()
  content?: string;

  @Field(() => String, { nullable: true, description: '封面图片 URL' })
  @IsOptional()
  coverImage?: string | null;

  @Field(() => String, { nullable: true, description: '文章摘要' })
  @IsOptional()
  @MaxLength(500)
  summary?: string;

  @Field(() => String, { nullable: true, description: '分类 ID' })
  @IsOptional()
  categoryId?: string | null;

  @Field(() => Boolean, { nullable: true, description: '是否置顶' })
  @IsOptional()
  isPinned?: boolean;

  @Field(() => ArticleStatus, { nullable: true, description: '文章状态' })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;
}
