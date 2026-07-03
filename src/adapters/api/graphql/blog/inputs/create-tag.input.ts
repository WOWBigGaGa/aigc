import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

@InputType({ description: '创建标签输入' })
export class CreateTagInput {
  @Field({ description: '标签名称' })
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @Field(() => String, { nullable: true, description: '标签 Slug' })
  @IsOptional()
  @MaxLength(50)
  slug?: string;
}
