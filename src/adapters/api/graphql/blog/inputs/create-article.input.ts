import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

@InputType({ description: '创建文章输入' })
export class CreateArticleInput {
  @Field({ description: '文章标题' })
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @Field({ description: '文章内容' })
  @IsNotEmpty()
  content!: string;

  @Field(() => String, { nullable: true, description: '封面图片 URL' })
  @IsOptional()
  coverImage?: string;

  @Field({ description: '文章摘要' })
  @IsNotEmpty()
  @MaxLength(500)
  summary!: string;

  @Field(() => String, { nullable: true, description: '分类 ID' })
  @IsOptional()
  categoryId?: string;

  @Field(() => Boolean, { nullable: true, description: '是否置顶' })
  @IsOptional()
  isPinned?: boolean;
}
