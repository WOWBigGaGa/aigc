import { Module } from '@nestjs/common';
import { BlogModule } from '@src/modules/blog/blog.module';
import { BlogUsecasesModule } from '@usecases/blog/blog-usecases.module';
import { ArticleResolver } from './resolvers/article.resolver';
import { CommentResolver } from './resolvers/comment.resolver';
import { CategoryResolver } from './resolvers/category.resolver';
import { TagResolver } from './resolvers/tag.resolver';
import { DashboardResolver } from './resolvers/dashboard.resolver';

@Module({
  imports: [BlogModule, BlogUsecasesModule],
  providers: [ArticleResolver, CommentResolver, CategoryResolver, TagResolver, DashboardResolver],
})
export class BlogGraphQLModule {}
