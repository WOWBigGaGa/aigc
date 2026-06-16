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
import { ArticleRepository } from './repositories/article.repository';
import { CommentRepository } from './repositories/comment.repository';
import { CategoryRepository } from './repositories/category.repository';
import { TagRepository } from './repositories/tag.repository';
import { ArticleQueryService } from './queries/article.query.service';
import { CommentQueryService } from './queries/comment.query.service';

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
    ]),
  ],
  providers: [
    ArticleRepository,
    CommentRepository,
    CategoryRepository,
    TagRepository,
    ArticleQueryService,
    CommentQueryService,
  ],
  exports: [TypeOrmModule, ArticleQueryService, CommentQueryService],
})
export class BlogModule {}
