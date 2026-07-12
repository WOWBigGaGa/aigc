import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ArticleDTO } from '../types/article.dto';
import { PaginatedArticlesDTO } from '../types/paginated-articles.dto';
import { AdjacentArticlesDTO } from '../types/adjacent-articles.dto';
import { CreateArticleInput } from '../inputs/create-article.input';
import { UpdateArticleInput } from '../inputs/update-article.input';
import { ArticleFilterInput } from '../inputs/article-filter.input';
import { PaginationInput } from '../inputs/pagination.input';
import { CreateArticleUsecase } from '@usecases/blog/create-article.usecase';
import { UpdateArticleUsecase } from '@usecases/blog/update-article.usecase';
import { DeleteArticleUsecase } from '@usecases/blog/delete-article.usecase';
import { LikeArticleUsecase } from '@usecases/blog/like-article.usecase';
import { ArticleQueryService } from '@src/modules/blog/queries/article.query.service';
import { mapJwtToUsecaseSession } from '@app-types/auth/session.types';
import { ArticleStatus } from '@src/modules/blog/blog.types';

@Resolver(() => ArticleDTO)
export class ArticleResolver {
  constructor(
    private readonly articleQueryService: ArticleQueryService,
    private readonly createArticleUsecase: CreateArticleUsecase,
    private readonly updateArticleUsecase: UpdateArticleUsecase,
    private readonly deleteArticleUsecase: DeleteArticleUsecase,
    private readonly likeArticleUsecase: LikeArticleUsecase,
  ) {}

  @Query(() => PaginatedArticlesDTO)
  async articles(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    @Args('filter', { nullable: true }) filter?: ArticleFilterInput,
  ): Promise<PaginatedArticlesDTO> {
    const result = await this.articleQueryService.getArticles(
      filter || {},
      pagination || { page: 1, limit: 10 },
    );
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      pageInfo: result.pageInfo,
    };
  }

  @Query(() => ArticleDTO, { nullable: true })
  async article(@Args('id') id: string): Promise<ArticleDTO | null> {
    return this.articleQueryService.getArticleById(id);
  }

  @Query(() => AdjacentArticlesDTO)
  async adjacentArticles(@Args('id') id: string): Promise<AdjacentArticlesDTO> {
    return this.articleQueryService.getAdjacentArticles(id);
  }

  @Mutation(() => ArticleDTO)
  @UseGuards(JwtAuthGuard)
  async createArticle(
    @Args('input') input: CreateArticleInput,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<ArticleDTO> {
    const session = mapJwtToUsecaseSession(context.req.user);
    return this.createArticleUsecase.execute({
      input,
      authorId: String(context.req.user.sub),
      session,
    });
  }

  @Mutation(() => ArticleDTO)
  @UseGuards(JwtAuthGuard)
  async updateArticle(
    @Args('id') id: string,
    @Args('input') input: UpdateArticleInput,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<ArticleDTO> {
    const session = mapJwtToUsecaseSession(context.req.user);
    return this.updateArticleUsecase.execute({ id, input, session });
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteArticle(
    @Args('id') id: string,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<boolean> {
    const session = mapJwtToUsecaseSession(context.req.user);
    await this.deleteArticleUsecase.execute({ id, session });
    return true;
  }

  @Mutation(() => ArticleDTO)
  @UseGuards(JwtAuthGuard)
  async toggleArticleStatus(
    @Args('id') id: string,
    @Args('status', { type: () => ArticleStatus }) status: ArticleStatus,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<ArticleDTO> {
    const session = mapJwtToUsecaseSession(context.req.user);
    return this.updateArticleUsecase.execute({ id, input: { status }, session });
  }

  @Mutation(() => ArticleDTO)
  async incrementViewCount(@Args('id') id: string): Promise<ArticleDTO> {
    await this.articleQueryService.incrementViewCount(id);
    return this.articleQueryService.getArticleById(id) as Promise<ArticleDTO>;
  }

  @Mutation(() => ArticleDTO)
  async incrementLikeCount(
    @Args('id') id: string,
    @Context()
    context: {
      req?: {
        user?: { sub: number; accessGroup: string[]; username: string; email: string | null };
        ip?: string;
      };
    },
  ): Promise<ArticleDTO> {
    const session = context.req?.user ? mapJwtToUsecaseSession(context.req.user) : undefined;
    const ipAddress = context.req?.ip;
    return this.likeArticleUsecase.execute({ id, session, ipAddress });
  }
}
