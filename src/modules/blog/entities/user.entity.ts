import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '用户主键 UUID' })
  id!: string;

  @Column({ name: 'username', type: 'varchar', length: 64, comment: '用户名' })
  @Index({ unique: true })
  username!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, comment: '密码哈希' })
  passwordHash!: string;

  @Column({ name: 'nickname', type: 'varchar', length: 64, comment: '昵称' })
  nickname!: string;

  @Column({
    name: 'avatar',
    type: 'varchar',
    length: 512,
    nullable: true,
    comment: '头像 URL',
  })
  avatar!: string | null;

  @Column({
    name: 'bio',
    type: 'varchar',
    length: 512,
    nullable: true,
    comment: '个人简介',
  })
  bio!: string | null;

  @Column({ name: 'email', type: 'varchar', length: 128, comment: '邮箱' })
  @Index({ unique: true })
  email!: string;

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
