import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '友链' })
export class FriendLinkDTO {
  @Field(() => ID, { description: '友链 ID' })
  id!: string;

  @Field({ description: '友链名称' })
  name!: string;

  @Field({ description: '友链 URL' })
  url!: string;

  @Field(() => String, { nullable: true, description: '友链描述' })
  description!: string | null;

  @Field(() => String, { nullable: true, description: '友链 Logo' })
  logo!: string | null;

  @Field(() => Number, { description: '排序顺序' })
  sort!: number;

  @Field(() => Boolean, { description: '是否启用' })
  isActive!: boolean;

  @Field(() => Date, { description: '创建时间' })
  createdAt!: Date;

  @Field(() => Date, { description: '更新时间' })
  updatedAt!: Date;
}
