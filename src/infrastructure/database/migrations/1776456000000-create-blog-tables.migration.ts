import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlogTables1776456000000 implements MigrationInterface {
  name = 'CreateBlogTables1776456000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE article (
        id CHAR(36) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        cover_image VARCHAR(512),
        summary VARCHAR(512) NOT NULL,
        status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
        category_id CHAR(36),
        author_id CHAR(36) NOT NULL,
        view_count INT UNSIGNED NOT NULL DEFAULT 0,
        like_count INT UNSIGNED NOT NULL DEFAULT 0,
        is_pinned TINYINT NOT NULL DEFAULT 0,
        published_at TIMESTAMP(3),
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        deleted_at TIMESTAMP(3),
        INDEX idx_article_status (status),
        INDEX idx_article_category (category_id),
        INDEX idx_article_author (author_id),
        INDEX idx_article_is_pinned (is_pinned),
        INDEX idx_article_deleted_at (deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE category (
        id CHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(64) NOT NULL,
        slug VARCHAR(64) NOT NULL,
        description VARCHAR(255),
        parent_id CHAR(36),
        sort INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        UNIQUE INDEX uk_category_name (name),
        UNIQUE INDEX uk_category_slug (slug),
        INDEX idx_category_parent (parent_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE tag (
        id CHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(64) NOT NULL,
        slug VARCHAR(64) NOT NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        UNIQUE INDEX uk_tag_name (name),
        UNIQUE INDEX uk_tag_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE article_tag (
        article_id CHAR(36) NOT NULL,
        tag_id CHAR(36) NOT NULL,
        PRIMARY KEY (article_id, tag_id),
        INDEX idx_article_tag_article (article_id),
        INDEX idx_article_tag_tag (tag_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE comment (
        id CHAR(36) NOT NULL PRIMARY KEY,
        article_id CHAR(36) NOT NULL,
        author_name VARCHAR(64) NOT NULL,
        author_email VARCHAR(128) NOT NULL,
        author_avatar VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        parent_id CHAR(36),
        status ENUM('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN') NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        deleted_at TIMESTAMP(3),
        INDEX idx_comment_article (article_id),
        INDEX idx_comment_parent (parent_id),
        INDEX idx_comment_status (status),
        INDEX idx_comment_deleted_at (deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE user (
        id CHAR(36) NOT NULL PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nickname VARCHAR(64) NOT NULL,
        avatar VARCHAR(512),
        bio VARCHAR(512),
        email VARCHAR(128) NOT NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        UNIQUE INDEX uk_user_username (username),
        UNIQUE INDEX uk_user_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE friend_link (
        id CHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(64) NOT NULL,
        url VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        logo VARCHAR(512),
        sort INT NOT NULL DEFAULT 0,
        is_active TINYINT NOT NULL DEFAULT 1,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX idx_friend_link_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE file (
        id CHAR(36) NOT NULL PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        stored_name VARCHAR(255) NOT NULL,
        path VARCHAR(512) NOT NULL,
        url VARCHAR(512) NOT NULL,
        mime_type VARCHAR(128) NOT NULL,
        size BIGINT UNSIGNED NOT NULL,
        uploaded_by CHAR(36) NOT NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX idx_file_uploaded_by (uploaded_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS file`);
    await queryRunner.query(`DROP TABLE IF EXISTS friend_link`);
    await queryRunner.query(`DROP TABLE IF EXISTS user`);
    await queryRunner.query(`DROP TABLE IF EXISTS comment`);
    await queryRunner.query(`DROP TABLE IF EXISTS article_tag`);
    await queryRunner.query(`DROP TABLE IF EXISTS tag`);
    await queryRunner.query(`DROP TABLE IF EXISTS category`);
    await queryRunner.query(`DROP TABLE IF EXISTS article`);
  }
}
