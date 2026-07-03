import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

@InputType({ description: '创建分类输入' })
export class CreateCategoryInput {
  @Field({ description: '分类名称' })
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @Field(() => String, { nullable: true, description: '分类 Slug' })
  @IsOptional()
  @MaxLength(100)
  slug?: string;

  @Field(() => String, { nullable: true, description: '分类描述' })
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @Field(() => String, { nullable: true, description: '父分类 ID' })
  @IsOptional()
  parentId?: string;

  @Field(() => Number, { nullable: true, description: '排序顺序' })
  @IsOptional()
  sort?: number;
}
