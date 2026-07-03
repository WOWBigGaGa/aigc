import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '归档统计' })
export class ArchiveDTO {
  @Field(() => Number, { description: '年份' })
  year!: number;

  @Field(() => Number, { description: '月份' })
  month!: number;

  @Field(() => Number, { description: '文章数量' })
  count!: number;
}
