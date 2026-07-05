import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { DashboardStatsDTO } from '../types/dashboard-stats.dto';
import { ArchiveDTO } from '../types/archive.dto';
import { ArticleQueryService } from '@src/modules/blog/queries/article.query.service';
import { CommentQueryService } from '@src/modules/blog/queries/comment.query.service';
import { CategoryQueryService } from '@src/modules/blog/queries/category.query.service';
import { TagQueryService } from '@src/modules/blog/queries/tag.query.service';

@Resolver()
export class DashboardResolver {
  constructor(
    private readonly articleQueryService: ArticleQueryService,
    private readonly commentQueryService: CommentQueryService,
    private readonly categoryQueryService: CategoryQueryService,
    private readonly tagQueryService: TagQueryService,
  ) {}

  @Query(() => DashboardStatsDTO)
  @UseGuards(JwtAuthGuard)
  async dashboardStats(): Promise<DashboardStatsDTO> {
    const [categoryCount, tagCount, articleStats, pendingComments, commentCount] =
      await Promise.all([
        this.categoryQueryService.getCategoryCount(),
        this.tagQueryService.getTagCount(),
        this.articleQueryService.getArticleStats(),
        this.commentQueryService.getPendingComments({ page: 1, limit: 1 }),
        this.commentQueryService.getTotalCommentCount(),
      ]);

    return {
      articleCount: articleStats.totalPublishedCount,
      commentCount,
      categoryCount,
      tagCount,
      totalViewCount: articleStats.totalViewCount,
      totalLikeCount: articleStats.totalLikeCount,
      pendingCommentCount: pendingComments.total,
    };
  }

  @Query(() => [ArchiveDTO])
  async archives(): Promise<ArchiveDTO[]> {
    return this.articleQueryService.getArchives();
  }
}
