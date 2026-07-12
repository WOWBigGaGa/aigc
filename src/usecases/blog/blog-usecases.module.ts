import { Module } from '@nestjs/common';
import { BlogInstallerModule } from '@src/modules/blog/blog-installer.module';
import { CreateArticleUsecase } from './create-article.usecase';
import { UpdateArticleUsecase } from './update-article.usecase';
import { DeleteArticleUsecase } from './delete-article.usecase';
import { CreateCategoryUsecase } from './create-category.usecase';
import { UpdateCategoryUsecase } from './update-category.usecase';
import { DeleteCategoryUsecase } from './delete-category.usecase';
import { CreateTagUsecase } from './create-tag.usecase';
import { UpdateTagUsecase } from './update-tag.usecase';
import { DeleteTagUsecase } from './delete-tag.usecase';
import { CreateCommentUsecase } from './create-comment.usecase';
import { UpdateCommentStatusUsecase } from './update-comment-status.usecase';
import { DeleteCommentUsecase } from './delete-comment.usecase';
import { ApproveCommentUsecase } from './approve-comment.usecase';
import { RejectCommentUsecase } from './reject-comment.usecase';
import { LikeArticleUsecase } from './like-article.usecase';

@Module({
  imports: [BlogInstallerModule],
  providers: [
    CreateArticleUsecase,
    UpdateArticleUsecase,
    DeleteArticleUsecase,
    CreateCategoryUsecase,
    UpdateCategoryUsecase,
    DeleteCategoryUsecase,
    CreateTagUsecase,
    UpdateTagUsecase,
    DeleteTagUsecase,
    CreateCommentUsecase,
    UpdateCommentStatusUsecase,
    DeleteCommentUsecase,
    ApproveCommentUsecase,
    RejectCommentUsecase,
    LikeArticleUsecase,
  ],
  exports: [
    CreateArticleUsecase,
    UpdateArticleUsecase,
    DeleteArticleUsecase,
    CreateCategoryUsecase,
    UpdateCategoryUsecase,
    DeleteCategoryUsecase,
    CreateTagUsecase,
    UpdateTagUsecase,
    DeleteTagUsecase,
    CreateCommentUsecase,
    UpdateCommentStatusUsecase,
    DeleteCommentUsecase,
    ApproveCommentUsecase,
    RejectCommentUsecase,
    LikeArticleUsecase,
  ],
})
export class BlogUsecasesModule {}
