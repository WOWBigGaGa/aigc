import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '标签' })
export class TagDTO {
  @Field(() => ID, { description: '标签 ID' })
  id!: string;

  @Field({ description: '标签名称' })
  name!: string;

  @Field({ description: '标签 Slug' })
  slug!: string;

  @Field(() => Date, { description: '创建时间' })
  createdAt!: Date;

  @Field(() => Date, { description: '更新时间' })
  updatedAt!: Date;
}
