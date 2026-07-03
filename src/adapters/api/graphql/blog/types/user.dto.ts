import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '用户' })
export class UserDTO {
  @Field(() => ID, { description: '用户 ID' })
  id!: string;

  @Field({ description: '用户名' })
  username!: string;

  @Field({ description: '昵称' })
  nickname!: string;

  @Field(() => String, { nullable: true, description: '用户头像' })
  avatar!: string | null;

  @Field(() => String, { nullable: true, description: '个人简介' })
  bio!: string | null;

  @Field({ description: '邮箱' })
  email!: string;

  @Field(() => Date, { description: '创建时间' })
  createdAt!: Date;

  @Field(() => Date, { description: '更新时间' })
  updatedAt!: Date;
}
