import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { DashboardStatsDTO } from '../types/dashboard-stats.dto';
import { ArchiveDTO } from '../types/archive.dto';
import { ArticleQueryService } from '@src/modules/blog/queries/article.query.service';
import { CommentQueryService } from '@src/modules/blog/queries/comment.query.service';
import { CategoryRepository } from '@src/modules/blog/repositories/category.repository';
import { TagRepository } from '@src/modules/blog/repositories/tag.repository';

@Resolver()
export class DashboardResolver {
  constructor(
    private readonly articleQueryService: ArticleQueryService,
    private readonly commentQueryService: CommentQueryService,
    private readonly categoryRepository: CategoryRepository,
    private readonly tagRepository: TagRepository,
  ) {}

  @Query(() => DashboardStatsDTO)
  @UseGuards(JwtAuthGuard)
  async dashboardStats(): Promise<DashboardStatsDTO> {
    const [categories, tags, articlesResult, pendingComments] = await Promise.all([
      this.categoryRepository.findAll(),
      this.tagRepository.findAll(),
      this.articleQueryService.getArticles({}, { page: 1, limit: 1000 }),
      this.commentQueryService.getPendingComments({ page: 1, limit: 1 }),
    ]);

    const categoryCount = categories.length;
    const tagCount = tags.length;
    const articleCount = articlesResult.total;
    const totalViewCount = articlesResult.items.reduce(
      (sum, article) => sum + (article.viewCount || 0),
      0,
    );
    const totalLikeCount = articlesResult.items.reduce(
      (sum, article) => sum + (article.likeCount || 0),
      0,
    );
    const pendingCommentCount = pendingComments.total;

    const commentsResult = await this.commentQueryService.getCommentsByArticle('0', {
      page: 1,
      limit: 1,
    });
    const commentCount = commentsResult.total;

    return {
      articleCount,
      commentCount,
      categoryCount,
      tagCount,
      totalViewCount,
      totalLikeCount,
      pendingCommentCount,
    };
  }

  @Query(() => [ArchiveDTO])
  async archives(): Promise<ArchiveDTO[]> {
    return this.articleQueryService.getArchives();
  }
}
