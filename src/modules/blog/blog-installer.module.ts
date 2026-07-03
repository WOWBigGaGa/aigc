import { Module } from '@nestjs/common';
import { BlogModule } from '@src/modules/blog/blog.module';

@Module({
  imports: [BlogModule],
  exports: [BlogModule],
})
export class BlogInstallerModule {}
