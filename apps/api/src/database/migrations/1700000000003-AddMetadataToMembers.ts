import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMetadataToMembers1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'members',
      new TableColumn({
        name: 'metadata',
        type: 'jsonb',
        isNullable: false,
        default: `'{}'`
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('members', 'metadata');
  }
}
