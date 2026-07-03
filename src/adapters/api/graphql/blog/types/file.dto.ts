import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '文件' })
export class FileDTO {
  @Field(() => ID, { description: '文件 ID' })
  id!: string;

  @Field({ description: '原始文件名' })
  originalName!: string;

  @Field({ description: '存储文件名' })
  storedName!: string;

  @Field({ description: '文件路径' })
  path!: string;

  @Field({ description: '文件 URL' })
  url!: string;

  @Field({ description: '文件 MIME 类型' })
  mimeType!: string;

  @Field(() => Number, { description: '文件大小（字节）' })
  size!: number;

  @Field({ description: '上传者 ID' })
  uploadedBy!: string;

  @Field(() => Date, { description: '创建时间' })
  createdAt!: Date;

  @Field(() => Date, { description: '更新时间' })
  updatedAt!: Date;
}
