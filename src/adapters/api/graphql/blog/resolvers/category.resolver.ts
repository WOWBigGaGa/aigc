import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CategoryDTO } from '../types/category.dto';
import { CreateCategoryInput } from '../inputs/create-category.input';
import { UpdateCategoryInput } from '../inputs/update-category.input';
import { CreateCategoryUsecase } from '@usecases/blog/create-category.usecase';
import { UpdateCategoryUsecase } from '@usecases/blog/update-category.usecase';
import { DeleteCategoryUsecase } from '@usecases/blog/delete-category.usecase';
import { CategoryRepository } from '@src/modules/blog/repositories/category.repository';
import { mapJwtToUsecaseSession } from '@app-types/auth/session.types';

@Resolver(() => CategoryDTO)
export class CategoryResolver {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly createCategoryUsecase: CreateCategoryUsecase,
    private readonly updateCategoryUsecase: UpdateCategoryUsecase,
    private readonly deleteCategoryUsecase: DeleteCategoryUsecase,
  ) {}

  @Query(() => [CategoryDTO])
  async categories(): Promise<CategoryDTO[]> {
    return this.categoryRepository.findAll();
  }

  @Mutation(() => CategoryDTO)
  @UseGuards(JwtAuthGuard)
  async createCategory(
    @Args('input') input: CreateCategoryInput,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<CategoryDTO> {
    const session = mapJwtToUsecaseSession(context.req.user);
    return this.createCategoryUsecase.execute({ input, session });
  }

  @Mutation(() => CategoryDTO)
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @Args('id') id: string,
    @Args('input') input: UpdateCategoryInput,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<CategoryDTO> {
    const session = mapJwtToUsecaseSession(context.req.user);
    return this.updateCategoryUsecase.execute({ id, input, session });
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteCategory(
    @Args('id') id: string,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<boolean> {
    const session = mapJwtToUsecaseSession(context.req.user);
    await this.deleteCategoryUsecase.execute({ id, session });
    return true;
  }
}
