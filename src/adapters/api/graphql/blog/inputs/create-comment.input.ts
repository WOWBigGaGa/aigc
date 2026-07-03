import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

@InputType({ description: '创建评论输入' })
export class CreateCommentInput {
  @Field({ description: '文章 ID' })
  @IsNotEmpty()
  articleId!: string;

  @Field({ description: '评论作者名称' })
  @IsNotEmpty()
  @MaxLength(50)
  authorName!: string;

  @Field({ description: '评论作者邮箱' })
  @IsNotEmpty()
  @IsEmail()
  authorEmail!: string;

  @Field({ description: '评论内容' })
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;

  @Field(() => String, { nullable: true, description: '父评论 ID（楼中楼）' })
  @IsOptional()
  parentId?: string;
}
