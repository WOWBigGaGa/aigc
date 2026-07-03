import { ObjectType } from '@nestjs/graphql';
import { paginatedTypeFactory } from '@src/adapters/api/graphql/pagination.type-factory';
import { ArticleDTO } from './article.dto';

@ObjectType({ description: '文章分页结果' })
export class PaginatedArticlesDTO extends paginatedTypeFactory(ArticleDTO) {}
