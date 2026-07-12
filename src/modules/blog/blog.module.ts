import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './entities/article.entity';
import { CategoryEntity } from './entities/category.entity';
import { TagEntity } from './entities/tag.entity';
import { ArticleTagEntity } from './entities/article-tag.entity';
import { CommentEntity } from './entities/comment.entity';
import { UserEntity } from './entities/user.entity';
import { FriendLinkEntity } from './entities/friend-link.entity';
import { FileEntity } from './entities/file.entity';
import { ArticleLikeEntity } from './entities/article-like.entity';
import { ArticleRepository } from './repositories/article.repository';
import { CommentRepository } from './repositories/comment.repository';
import { CategoryRepository } from './repositories/category.repository';
import { TagRepository } from './repositories/tag.repository';
import { ArticleLikeRepository } from './repositories/article-like.repository';
import { FriendLinkRepository } from './repositories/friend-link.repository';
import { ArticleQueryService } from './queries/article.query.service';
import { CommentQueryService } from './queries/comment.query.service';
import { FriendLinkQueryService } from './queries/friend-link.query.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArticleEntity,
      CategoryEntity,
      TagEntity,
      ArticleTagEntity,
      CommentEntity,
      UserEntity,
      FriendLinkEntity,
      FileEntity,
      ArticleLikeEntity,
    ]),
  ],
  providers: [
    ArticleRepository,
    CommentRepository,
    CategoryRepository,
    TagRepository,
    ArticleLikeRepository,
    FriendLinkRepository,
    ArticleQueryService,
    CommentQueryService,
    FriendLinkQueryService,
  ],
  exports: [
    TypeOrmModule,
    ArticleRepository,
    CommentRepository,
    CategoryRepository,
    TagRepository,
    ArticleLikeRepository,
    FriendLinkRepository,
    ArticleQueryService,
    CommentQueryService,
    FriendLinkQueryService,
  ],
})
export class BlogModule {}
