import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class WorkoutsAndNotifications1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create EXERCISES table
    await queryRunner.createTable(
      new Table({
        name: 'exercises',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'muscleGroup', type: 'varchar', length: '50' },
          { name: 'equipment', type: 'varchar', length: '100', isNullable: true },
          {
            name: 'difficulty',
            type: 'varchar',
            length: '20',
            enum: ['beginner', 'intermediate', 'advanced']
          },
          { name: 'videoUrl', type: 'varchar', length: '500', isNullable: true },
          { name: 'imageUrls', type: 'jsonb', default: "'[]'" },
          { name: 'instructions', type: 'text', isNullable: true },
          { name: 'tips', type: 'text', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'exercises',
      new TableIndex({
        name: 'idx_exercises_muscle',
        columnNames: ['muscleGroup']
      })
    );

    await queryRunner.createIndex(
      'exercises',
      new TableIndex({
        name: 'idx_exercises_equipment',
        columnNames: ['equipment']
      })
    );

    // Create WORKOUT_PLANS table
    await queryRunner.createTable(
      new Table({
        name: 'workout_plans',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'trainerId', type: 'uuid', isNullable: true },
          { name: 'memberId', type: 'uuid', isNullable: true },
          { name: 'gymId', type: 'uuid' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'difficulty',
            type: 'varchar',
            length: '20',
            enum: ['beginner', 'intermediate', 'advanced']
          },
          { name: 'durationWeeks', type: 'integer', isNullable: true },
          { name: 'sessionsPerWeek', type: 'integer', isNullable: true },
          { name: 'isTemplate', type: 'boolean', default: false },
          { name: 'isActive', type: 'boolean', default: true },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ],
        foreignKeys: [
          {
            columnNames: ['trainerId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL'
          },
          {
            columnNames: ['memberId'],
            referencedTableName: 'members',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          },
          {
            columnNames: ['gymId'],
            referencedTableName: 'gyms',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'workout_plans',
      new TableIndex({
        name: 'idx_plans_trainer',
        columnNames: ['trainerId']
      })
    );

    await queryRunner.createIndex(
      'workout_plans',
      new TableIndex({
        name: 'idx_plans_member',
        columnNames: ['memberId']
      })
    );

    await queryRunner.createIndex(
      'workout_plans',
      new TableIndex({
        name: 'idx_plans_gym',
        columnNames: ['gymId']
      })
    );

    // Create PLAN_EXERCISES table
    await queryRunner.createTable(
      new Table({
        name: 'plan_exercises',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'planId', type: 'uuid' },
          { name: 'exerciseId', type: 'uuid' },
          { name: 'dayNumber', type: 'integer' },
          { name: 'orderIndex', type: 'integer' },
          { name: 'sets', type: 'integer', isNullable: true },
          { name: 'reps', type: 'varchar', length: '20', isNullable: true },
          { name: 'restSeconds', type: 'integer', default: 60 },
          { name: 'notes', type: 'text', isNullable: true }
        ],
        foreignKeys: [
          {
            columnNames: ['planId'],
            referencedTableName: 'workout_plans',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          },
          {
            columnNames: ['exerciseId'],
            referencedTableName: 'exercises',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL'
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'plan_exercises',
      new TableIndex({
        name: 'idx_plan_exercises_plan',
        columnNames: ['planId']
      })
    );

    // Create MEMBER_PROGRESS table
    await queryRunner.createTable(
      new Table({
        name: 'member_progress',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'memberId', type: 'uuid' },
          {
            name: 'recordedAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          },
          { name: 'weightKg', type: 'numeric', precision: 5, scale: 2, isNullable: true },
          { name: 'bodyFatPct', type: 'numeric', precision: 5, scale: 2, isNullable: true },
          { name: 'muscleMassKg', type: 'numeric', precision: 5, scale: 2, isNullable: true },
          { name: 'bmi', type: 'numeric', precision: 4, scale: 1, isNullable: true },
          { name: 'chestCm', type: 'numeric', precision: 5, scale: 1, isNullable: true },
          { name: 'waistCm', type: 'numeric', precision: 5, scale: 1, isNullable: true },
          { name: 'hipsCm', type: 'numeric', precision: 5, scale: 1, isNullable: true },
          { name: 'armsCm', type: 'numeric', precision: 5, scale: 1, isNullable: true },
          { name: 'thighsCm', type: 'numeric', precision: 5, scale: 1, isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'photoFrontUrl', type: 'varchar', length: '500', isNullable: true },
          { name: 'photoSideUrl', type: 'varchar', length: '500', isNullable: true },
          { name: 'photoBackUrl', type: 'varchar', length: '500', isNullable: true }
        ],
        foreignKeys: [
          {
            columnNames: ['memberId'],
            referencedTableName: 'members',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'member_progress',
      new TableIndex({
        name: 'idx_progress_member',
        columnNames: ['memberId', 'recordedAt']
      })
    );

    // Create NOTIFICATIONS table
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'recipientId', type: 'uuid', isNullable: true },
          { name: 'gymId', type: 'uuid', isNullable: true },
          {
            name: 'type',
            type: 'varchar',
            length: '20',
            enum: ['email', 'sms', 'push', 'in_app']
          },
          { name: 'templateKey', type: 'varchar', length: '100' },
          { name: 'subject', type: 'varchar', length: '255', isNullable: true },
          { name: 'content', type: 'text' },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'pending'",
            enum: ['pending', 'sent', 'failed', 'bounced']
          },
          { name: 'sentAt', type: 'timestamptz', isNullable: true },
          { name: 'openedAt', type: 'timestamptz', isNullable: true },
          { name: 'errorMessage', type: 'text', isNullable: true },
          { name: 'metadata', type: 'jsonb', default: "'{}'" },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ],
        foreignKeys: [
          {
            columnNames: ['recipientId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          },
          {
            columnNames: ['gymId'],
            referencedTableName: 'gyms',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notif_recipient',
        columnNames: ['recipientId']
      })
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notif_status',
        columnNames: ['status']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications', true);
    await queryRunner.dropTable('member_progress', true);
    await queryRunner.dropTable('plan_exercises', true);
    await queryRunner.dropTable('workout_plans', true);
    await queryRunner.dropTable('exercises', true);
  }
}
