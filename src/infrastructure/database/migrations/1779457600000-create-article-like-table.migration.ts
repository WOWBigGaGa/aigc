import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticleLikeTable1779457600000 implements MigrationInterface {
  name = 'CreateArticleLikeTable1779457600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE article_like (
        id CHAR(36) PRIMARY KEY COMMENT '点赞记录主键 UUID',
        article_id CHAR(36) NOT NULL COMMENT '文章 ID',
        user_id CHAR(36) NULL COMMENT '用户 ID（登录用户）',
        ip_address VARCHAR(45) NULL COMMENT 'IP 地址（匿名用户）',
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
        INDEX idx_article_like_article_id (article_id),
        INDEX idx_article_like_user_id (user_id),
        INDEX idx_article_like_ip_address (ip_address),
        CONSTRAINT uk_article_user_like UNIQUE (article_id, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章点赞记录表'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE article_like`);
  }
}
