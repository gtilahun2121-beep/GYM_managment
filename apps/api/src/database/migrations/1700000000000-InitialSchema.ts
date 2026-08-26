import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create GYMS table
    await queryRunner.createTable(
      new Table({
        name: 'gyms',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'slug', type: 'varchar', length: '100', isUnique: true },
          { name: 'address', type: 'text', isNullable: true },
          { name: 'city', type: 'varchar', length: '100', isNullable: true },
          { name: 'state', type: 'varchar', length: '100', isNullable: true },
          { name: 'zipCode', type: 'varchar', length: '20', isNullable: true },
          { name: 'country', type: 'varchar', length: '100', default: "'US'" },
          { name: 'timezone', type: 'varchar', length: '50', default: "'America/New_York'" },
          { name: 'phone', type: 'varchar', length: '30', isNullable: true },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          { name: 'logoUrl', type: 'varchar', length: '500', isNullable: true },
          { name: 'settings', type: 'jsonb', default: "'{}'" },
          { name: 'isActive', type: 'boolean', default: true },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'gyms',
      new TableIndex({
        name: 'idx_gyms_slug',
        columnNames: ['slug'],
        isUnique: true
      })
    );

    await queryRunner.createIndex(
      'gyms',
      new TableIndex({
        name: 'idx_gyms_active',
        columnNames: ['isActive']
      })
    );

    // Create USERS table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'gymId', type: 'uuid', isNullable: true },
          { name: 'email', type: 'varchar', length: '255' },
          { name: 'passwordHash', type: 'varchar', length: '255' },
          {
            name: 'role',
            type: 'varchar',
            length: '20',
            enum: ['super_admin', 'gym_manager', 'receptionist', 'trainer', 'member']
          },
          { name: 'firstName', type: 'varchar', length: '100' },
          { name: 'lastName', type: 'varchar', length: '100' },
          { name: 'phone', type: 'varchar', length: '30', isNullable: true },
          { name: 'avatarUrl', type: 'varchar', length: '500', isNullable: true },
          { name: 'emailVerified', type: 'boolean', default: false },
          { name: 'mfaEnabled', type: 'boolean', default: false },
          { name: 'mfaSecret', type: 'varchar', length: '255', isNullable: true },
          { name: 'lastLoginAt', type: 'timestamptz', isNullable: true },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'active'",
            enum: ['active', 'inactive', 'suspended', 'deleted']
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ],
        foreignKeys: [
          {
            columnNames: ['gymId'],
            referencedTableName: 'gyms',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ],
        uniques: [
          {
            name: 'uq_users_gym_email',
            columnNames: ['gymId', 'email']
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_gym_email',
        columnNames: ['gymId', 'email']
      })
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_role',
        columnNames: ['gymId', 'role']
      })
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_status',
        columnNames: ['gymId', 'status']
      })
    );

    // Create MEMBERS table
    await queryRunner.createTable(
      new Table({
        name: 'members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'userId', type: 'uuid' },
          { name: 'gymId', type: 'uuid' },
          { name: 'dateOfBirth', type: 'date', isNullable: true },
          { name: 'gender', type: 'varchar', length: '20', isNullable: true },
          { name: 'emergencyContactName', type: 'varchar', length: '100', isNullable: true },
          { name: 'emergencyContactPhone', type: 'varchar', length: '30', isNullable: true },
          { name: 'healthNotes', type: 'text', isNullable: true },
          { name: 'fitnessGoals', type: 'jsonb', default: "'[]'" },
          { name: 'qrCodeHash', type: 'varchar', length: '255', isUnique: true },
          { name: 'referralCode', type: 'varchar', length: '20', isUnique: true },
          { name: 'referredBy', type: 'uuid', isNullable: true },
          { name: 'membershipStartDate', type: 'date' },
          { name: 'membershipEndDate', type: 'date', isNullable: true },
          { name: 'totalCheckIns', type: 'integer', default: 0 },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          },
          {
            columnNames: ['gymId'],
            referencedTableName: 'gyms',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          },
          {
            columnNames: ['referredBy'],
            referencedTableName: 'members',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL'
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'members',
      new TableIndex({
        name: 'idx_members_gym',
        columnNames: ['gymId']
      })
    );

    await queryRunner.createIndex(
      'members',
      new TableIndex({
        name: 'idx_members_qr',
        columnNames: ['qrCodeHash'],
        isUnique: true
      })
    );

    // Create MEMBERSHIP_PLANS table
    await queryRunner.createTable(
      new Table({
        name: 'membership_plans',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'gymId', type: 'uuid' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'billingFrequency',
            type: 'varchar',
            length: '20',
            enum: ['monthly', 'quarterly', 'annual', 'one_time']
          },
          { name: 'price', type: 'numeric', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', length: '3', default: "'USD'" },
          { name: 'features', type: 'jsonb', default: "'{}'" },
          { name: 'maxBookingsPerWeek', type: 'integer', default: 7 },
          { name: 'cancellationPolicy', type: 'text', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'displayOrder', type: 'integer', default: 0 },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ],
        foreignKeys: [
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
      'membership_plans',
      new TableIndex({
        name: 'idx_plans_gym_active',
        columnNames: ['gymId', 'isActive']
      })
    );

    // Create MEMBERSHIP_SUBSCRIPTIONS table
    await queryRunner.createTable(
      new Table({
        name: 'membership_subscriptions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'memberId', type: 'uuid' },
          { name: 'planId', type: 'uuid' },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'active'",
            enum: ['active', 'cancelled', 'expired', 'frozen', 'pending_payment']
          },
          { name: 'startDate', type: 'date' },
          { name: 'endDate', type: 'date', isNullable: true },
          { name: 'autoRenew', type: 'boolean', default: true },
          { name: 'stripeSubscriptionId', type: 'varchar', length: '255', isNullable: true },
          { name: 'stripeCustomerId', type: 'varchar', length: '255', isNullable: true },
          { name: 'paymentMethodId', type: 'uuid', isNullable: true },
          { name: 'cancelledAt', type: 'timestamptz', isNullable: true },
          { name: 'cancellationReason', type: 'varchar', length: '255', isNullable: true },
          { name: 'frozenUntil', type: 'date', isNullable: true },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ],
        foreignKeys: [
          {
            columnNames: ['memberId'],
            referencedTableName: 'members',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          },
          {
            columnNames: ['planId'],
            referencedTableName: 'membership_plans',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL'
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'membership_subscriptions',
      new TableIndex({
        name: 'idx_subs_member',
        columnNames: ['memberId']
      })
    );

    await queryRunner.createIndex(
      'membership_subscriptions',
      new TableIndex({
        name: 'idx_subs_status',
        columnNames: ['status']
      })
    );

    await queryRunner.createIndex(
      'membership_subscriptions',
      new TableIndex({
        name: 'idx_subs_stripe',
        columnNames: ['stripeSubscriptionId']
      })
    );

    // Create CLASS_TYPES table
    await queryRunner.createTable(
      new Table({
        name: 'class_types',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'gymId', type: 'uuid' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'durationMinutes', type: 'integer', default: 60 },
          {
            name: 'intensityLevel',
            type: 'varchar',
            length: '20',
            enum: ['low', 'moderate', 'high', 'extreme']
          },
          { name: 'maxCapacity', type: 'integer', default: 20 },
          { name: 'colorCode', type: 'varchar', length: '7', default: "'#3B82F6'" },
          { name: 'equipmentNeeded', type: 'jsonb', default: "'[]'" },
          { name: 'imageUrl', type: 'varchar', length: '500', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ],
        foreignKeys: [
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

    // Create ROOMS table
    await queryRunner.createTable(
      new Table({
        name: 'rooms',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'gymId', type: 'uuid' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'capacity', type: 'integer' },
          { name: 'type', type: 'varchar', length: '50', isNullable: true },
          { name: 'amenities', type: 'jsonb', default: "'[]'" },
          { name: 'isActive', type: 'boolean', default: true },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ],
        foreignKeys: [
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

    // Create CLASS_SESSIONS table
    await queryRunner.createTable(
      new Table({
        name: 'class_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'gymId', type: 'uuid' },
          { name: 'classTypeId', type: 'uuid' },
          { name: 'trainerId', type: 'uuid' },
          { name: 'roomId', type: 'uuid' },
          { name: 'startTime', type: 'timestamptz' },
          { name: 'endTime', type: 'timestamptz' },
          { name: 'maxCapacity', type: 'integer' },
          { name: 'currentBookings', type: 'integer', default: 0 },
          { name: 'waitlistCount', type: 'integer', default: 0 },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'scheduled'",
            enum: ['scheduled', 'cancelled', 'completed', 'in_progress']
          },
          { name: 'isRecurring', type: 'boolean', default: false },
          { name: 'recurrenceRule', type: 'varchar', length: '255', isNullable: true },
          { name: 'parentSessionId', type: 'uuid', isNullable: true },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ],
        foreignKeys: [
          {
            columnNames: ['gymId'],
            referencedTableName: 'gyms',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          },
          {
            columnNames: ['classTypeId'],
            referencedTableName: 'class_types',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL'
          },
          {
            columnNames: ['trainerId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL'
          },
          {
            columnNames: ['roomId'],
            referencedTableName: 'rooms',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL'
          },
          {
            columnNames: ['parentSessionId'],
            referencedTableName: 'class_sessions',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL'
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'class_sessions',
      new TableIndex({
        name: 'idx_sessions_time',
        columnNames: ['startTime', 'endTime']
      })
    );

    await queryRunner.createIndex(
      'class_sessions',
      new TableIndex({
        name: 'idx_sessions_gym_time',
        columnNames: ['gymId', 'startTime']
      })
    );

    await queryRunner.createIndex(
      'class_sessions',
      new TableIndex({
        name: 'idx_sessions_trainer',
        columnNames: ['trainerId', 'startTime']
      })
    );

    await queryRunner.createIndex(
      'class_sessions',
      new TableIndex({
        name: 'idx_sessions_status',
        columnNames: ['status']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('class_sessions', true);
    await queryRunner.dropTable('rooms', true);
    await queryRunner.dropTable('class_types', true);
    await queryRunner.dropTable('membership_subscriptions', true);
    await queryRunner.dropTable('membership_plans', true);
    await queryRunner.dropTable('members', true);
    await queryRunner.dropTable('users', true);
    await queryRunner.dropTable('gyms', true);
  }
}
