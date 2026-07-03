import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, MaxLength } from 'class-validator';

@InputType({ description: '更新标签输入' })
export class UpdateTagInput {
  @Field(() => String, { nullable: true, description: '标签名称' })
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @Field(() => String, { nullable: true, description: '标签 Slug' })
  @IsOptional()
  @MaxLength(50)
  slug?: string;
}
