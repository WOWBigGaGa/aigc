import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '分类' })
export class CategoryDTO {
  @Field(() => ID, { description: '分类 ID' })
  id!: string;

  @Field({ description: '分类名称' })
  name!: string;

  @Field({ description: '分类 Slug' })
  slug!: string;

  @Field(() => String, { nullable: true, description: '分类描述' })
  description!: string | null;

  @Field(() => String, { nullable: true, description: '父分类 ID' })
  parentId!: string | null;

  @Field(() => Number, { description: '排序顺序' })
  sort!: number;

  @Field(() => Date, { description: '创建时间' })
  createdAt!: Date;

  @Field(() => Date, { description: '更新时间' })
  updatedAt!: Date;
}
