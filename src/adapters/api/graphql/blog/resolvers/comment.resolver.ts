import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CommentDTO } from '../types/comment.dto';
import { CommentTreeDTO } from '../types/comment-tree.dto';
import { PaginatedCommentsDTO } from '../types/paginated-comments.dto';
import { CreateCommentInput } from '../inputs/create-comment.input';
import { PaginationInput } from '../inputs/pagination.input';
import { CreateCommentUsecase } from '@usecases/blog/create-comment.usecase';
import { ApproveCommentUsecase } from '@usecases/blog/approve-comment.usecase';
import { RejectCommentUsecase } from '@usecases/blog/reject-comment.usecase';
import { DeleteCommentUsecase } from '@usecases/blog/delete-comment.usecase';
import { CommentQueryService } from '@src/modules/blog/queries/comment.query.service';
import { mapJwtToUsecaseSession } from '@app-types/auth/session.types';

@Resolver(() => CommentDTO)
export class CommentResolver {
  constructor(
    private readonly commentQueryService: CommentQueryService,
    private readonly createCommentUsecase: CreateCommentUsecase,
    private readonly approveCommentUsecase: ApproveCommentUsecase,
    private readonly rejectCommentUsecase: RejectCommentUsecase,
    private readonly deleteCommentUsecase: DeleteCommentUsecase,
  ) {}

  @Query(() => PaginatedCommentsDTO)
  async comments(
    @Args('articleId') articleId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedCommentsDTO> {
    const result = await this.commentQueryService.getCommentsByArticle(
      articleId,
      pagination || { page: 1, limit: 20 },
    );
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      pageInfo: result.pageInfo,
    };
  }

  @Query(() => PaginatedCommentsDTO)
  @UseGuards(JwtAuthGuard)
  async pendingComments(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedCommentsDTO> {
    const result = await this.commentQueryService.getPendingComments(
      pagination || { page: 1, limit: 20 },
    );
    return {
      items: result.items as CommentTreeDTO[],
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      pageInfo: result.pageInfo,
    };
  }

  @Mutation(() => CommentDTO)
  async createComment(
    @Args('input') input: CreateCommentInput,
    @Context()
    context: {
      req?: {
        user?: { sub: number; accessGroup: string[]; username: string; email: string | null };
      };
    },
  ): Promise<CommentDTO> {
    const session = context.req?.user
      ? mapJwtToUsecaseSession(context.req.user)
      : { accountId: 0, roles: ['REGISTRANT'] };
    return this.createCommentUsecase.execute({ input, session });
  }

  @Mutation(() => CommentDTO)
  @UseGuards(JwtAuthGuard)
  async approveComment(
    @Args('id') id: string,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<CommentDTO> {
    const session = mapJwtToUsecaseSession(context.req.user);
    return this.approveCommentUsecase.execute({ id, session });
  }

  @Mutation(() => CommentDTO)
  @UseGuards(JwtAuthGuard)
  async rejectComment(
    @Args('id') id: string,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<CommentDTO> {
    const session = mapJwtToUsecaseSession(context.req.user);
    return this.rejectCommentUsecase.execute({ id, session });
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Args('id') id: string,
    @Context()
    context: {
      req: { user: { sub: number; accessGroup: string[]; username: string; email: string | null } };
    },
  ): Promise<boolean> {
    const session = mapJwtToUsecaseSession(context.req.user);
    await this.deleteCommentUsecase.execute({ id, session });
    return true;
  }
}
