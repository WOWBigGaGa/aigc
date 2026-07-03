import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, MaxLength } from 'class-validator';

@InputType({ description: '更新分类输入' })
export class UpdateCategoryInput {
  @Field(() => String, { nullable: true, description: '分类名称' })
  @IsOptional()
  @MaxLength(100)
  name?: string;

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
  parentId?: string | null;

  @Field(() => Number, { nullable: true, description: '排序顺序' })
  @IsOptional()
  sort?: number;
}
