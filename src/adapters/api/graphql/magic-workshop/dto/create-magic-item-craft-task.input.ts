import { Field, InputType } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { MagicItemType } from '@src/modules/magic-workshop/magic-workshop.types';

@InputType()
export class CreateMagicItemCraftTaskInput {
  @Field(() => String)
  @IsNotEmpty()
  itemName!: string;

  @Field(() => MagicItemType)
  @IsIn([MagicItemType.WEAPON, MagicItemType.ARMOR, MagicItemType.TOOL, MagicItemType.TOY])
  itemType!: MagicItemType;

  @Field(() => Number)
  @Min(1)
  @Max(5)
  materialLevel!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  requestNote?: string;
}
