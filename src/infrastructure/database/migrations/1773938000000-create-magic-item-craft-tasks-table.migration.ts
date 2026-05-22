import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMagicItemCraftTasksTable1773938000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'magic_item_craft_tasks',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'item_name',
            type: 'varchar',
            length: '128',
            isNullable: false,
          },
          {
            name: 'item_type',
            type: 'enum',
            enum: ['WEAPON', 'ARMOR', 'TOOL', 'TOY'],
            isNullable: false,
          },
          {
            name: 'material_level',
            type: 'tinyint',
            unsigned: true,
            isNullable: false,
          },
          {
            name: 'request_note',
            type: 'varchar',
            length: '512',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED'],
            isNullable: false,
            default: "'PENDING'",
          },
          {
            name: 'quality_level',
            type: 'enum',
            enum: ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'],
            isNullable: true,
          },
          {
            name: 'result_description',
            type: 'varchar',
            length: '1024',
            isNullable: true,
          },
          {
            name: 'failure_reason',
            type: 'varchar',
            length: '1024',
            isNullable: true,
          },
          {
            name: 'craft_log',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
            onUpdate: 'CURRENT_TIMESTAMP(3)',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('magic_item_craft_tasks', true);
  }
}
