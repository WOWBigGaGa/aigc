import { ObjectType } from '@nestjs/graphql';
import { paginatedTypeFactory } from '@src/adapters/api/graphql/pagination.type-factory';
import { CommentDTO } from './comment.dto';

@ObjectType({ description: '待审核评论分页结果' })
export class PaginatedPendingCommentsDTO extends paginatedTypeFactory(CommentDTO) {}
