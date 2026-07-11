import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugColumnToArticle1778630400000 implements MigrationInterface {
  name = 'AddSlugColumnToArticle1778630400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE article
      ADD COLUMN slug VARCHAR(255) NULL COMMENT '文章 slug'
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX uk_article_slug ON article (slug)
      WHERE slug IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX uk_article_slug ON article`);
    await queryRunner.query(`ALTER TABLE article DROP COLUMN slug`);
  }
}
