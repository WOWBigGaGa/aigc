import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('file')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '文件主键 UUID' })
  id!: string;

  @Column({ name: 'original_name', type: 'varchar', length: 255, comment: '原始文件名' })
  originalName!: string;

  @Column({ name: 'stored_name', type: 'varchar', length: 255, comment: '存储文件名' })
  storedName!: string;

  @Column({ name: 'path', type: 'varchar', length: 512, comment: '文件路径' })
  path!: string;

  @Column({ name: 'url', type: 'varchar', length: 512, comment: '文件访问 URL' })
  url!: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 128, comment: 'MIME 类型' })
  mimeType!: string;

  @Column({ name: 'size', type: 'bigint', unsigned: true, comment: '文件大小（字节）' })
  size!: number;

  @Column({ name: 'uploaded_by', type: 'char', length: 36, comment: '上传者 ID' })
  uploadedBy!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    comment: '创建时间',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    comment: '更新时间',
  })
  updatedAt!: Date;
}
