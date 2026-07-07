import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TagDTO } from '../types/tag.dto';
import { CreateTagInput } from '../inputs/create-tag.input';
import { UpdateTagInput } from '../inputs/update-tag.input';
import { CreateTagUsecase } from '@usecases/blog/create-tag.usecase';
import { UpdateTagUsecase } from '@usecases/blog/update-tag.usecase';
import { DeleteTagUsecase } from '@usecases/blog/delete-tag.usecase';
import { TagQueryService } from '@src/modules/blog/queries/tag.query.service';
import { mapJwtToUsecaseSession } from '@app-types/auth/session.types';

@Resolver(() => TagDTO)
export class TagResolver {
  constructor(
    private readonly tagQueryService: TagQueryService,
    private readonly createTagUsecase: CreateTagUsecase,
    private readonly updateTagUsecase: UpdateTagUsecase,
    private readonly deleteTagUsecase: DeleteTagUsecase,
  ) {}

  @Query(() => [TagDTO])
  async tags(): Promise<TagDTO[]> {
    return this.tagQueryService.getAllTags();
  }

  @Mutation(() => TagDTO)
  @UseGuards(JwtAuthGuard)
  async createTag(
    @Args('input') input: CreateTagInput,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<TagDTO> {
    const session = mapJwtToUsecaseSession(context.req.user);
    return this.createTagUsecase.execute({ input, session });
  }

  @Mutation(() => TagDTO)
  @UseGuards(JwtAuthGuard)
  async updateTag(
    @Args('id') id: string,
    @Args('input') input: UpdateTagInput,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<TagDTO> {
    const session = mapJwtToUsecaseSession(context.req.user);
    return this.updateTagUsecase.execute({ id, input, session });
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteTag(
    @Args('id') id: string,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<boolean> {
    const session = mapJwtToUsecaseSession(context.req.user);
    await this.deleteTagUsecase.execute({ id, session });
    return true;
  }
}
