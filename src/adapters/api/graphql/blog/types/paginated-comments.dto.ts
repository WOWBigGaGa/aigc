import { ObjectType } from '@nestjs/graphql';
import { paginatedTypeFactory } from '@src/adapters/api/graphql/pagination.type-factory';
import { CommentTreeDTO } from './comment-tree.dto';

@ObjectType({ description: '评论分页结果' })
export class PaginatedCommentsDTO extends paginatedTypeFactory(CommentTreeDTO) {}
