import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, Max, Min } from 'class-validator';

@ArgsType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1, description: '页码（从1开始）' })
  @IsInt()
  @Min(1)
  page!: number;

  @Field(() => Int, { defaultValue: 10, description: '每页数量' })
  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number;
}
