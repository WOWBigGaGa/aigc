import { Module } from '@nestjs/common';
import { BlogModule } from '@src/modules/blog/blog.module';

@Module({
  imports: [BlogModule],
})
export class BlogGraphQLModule {}
