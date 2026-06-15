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
  exports: [TypeOrmModule],
})
export class BlogModule {}
