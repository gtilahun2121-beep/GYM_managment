import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class BookingsAndPayments1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create BOOKINGS table
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'sessionId', type: 'uuid' },
          { name: 'memberId', type: 'uuid' },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'confirmed'",
            enum: ['confirmed', 'cancelled', 'no_show', 'attended', 'waitlist']
          },
          {
            name: 'bookedAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          },
          { name: 'checkedInAt', type: 'timestamptz', isNullable: true },
          { name: 'cancelledAt', type: 'timestamptz', isNullable: true },
          { name: 'cancellationReason', type: 'varchar', length: '255', isNullable: true },
          { name: 'waitlistPosition', type: 'integer', isNullable: true },
          { name: 'isWaitlistPromoted', type: 'boolean', default: false },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ],
        foreignKeys: [
          {
            columnNames: ['sessionId'],
            referencedTableName: 'class_sessions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          },
          {
            columnNames: ['memberId'],
            referencedTableName: 'members',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ],
        uniques: [
          {
            name: 'uq_bookings_session_member',
            columnNames: ['sessionId', 'memberId']
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'idx_bookings_member',
        columnNames: ['memberId', 'status']
      })
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'idx_bookings_session',
        columnNames: ['sessionId', 'status']
      })
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'idx_bookings_waitlist',
        columnNames: ['sessionId', 'waitlistPosition'],
        where: "status = 'waitlist'"
      })
    );

    // Create WAITLIST_ENTRIES table
    await queryRunner.createTable(
      new Table({
        name: 'waitlist_entries',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'sessionId', type: 'uuid' },
          { name: 'memberId', type: 'uuid' },
          { name: 'position', type: 'integer' },
          { name: 'notifiedAt', type: 'timestamptz', isNullable: true },
          { name: 'promotedAt', type: 'timestamptz', isNullable: true },
          { name: 'expiresAt', type: 'timestamptz', isNullable: true },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          }
        ],
        foreignKeys: [
          {
            columnNames: ['sessionId'],
            referencedTableName: 'class_sessions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          },
          {
            columnNames: ['memberId'],
            referencedTableName: 'members',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ],
        uniques: [
          {
            name: 'uq_waitlist_session_member',
            columnNames: ['sessionId', 'memberId']
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'waitlist_entries',
      new TableIndex({
        name: 'idx_waitlist_session',
        columnNames: ['sessionId', 'position']
      })
    );

    // Create PAYMENTS table
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'gymId', type: 'uuid' },
          { name: 'memberId', type: 'uuid', isNullable: true },
          { name: 'subscriptionId', type: 'uuid', isNullable: true },
          { name: 'amount', type: 'numeric', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', length: '3', default: "'USD'" },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'pending'",
            enum: ['pending', 'succeeded', 'failed', 'refunded', 'disputed']
          },
          {
            name: 'type',
            type: 'varchar',
            length: '30',
            enum: ['subscription', 'one_time', 'refund', 'commission', 'merchandise']
          },
          { name: 'stripePaymentIntentId', type: 'varchar', length: '255', isNullable: true },
          { name: 'stripeChargeId', type: 'varchar', length: '255', isNullable: true },
          { name: 'description', type: 'varchar', length: '255', isNullable: true },
          { name: 'metadata', type: 'jsonb', default: "'{}'" },
          { name: 'refundedAmount', type: 'numeric', precision: 10, scale: 2, default: 0 },
          { name: 'failureReason', type: 'varchar', length: '255', isNullable: true },
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
            columnNames: ['memberId'],
            referencedTableName: 'members',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL'
          },
          {
            columnNames: ['subscriptionId'],
            referencedTableName: 'membership_subscriptions',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL'
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'idx_payments_member',
        columnNames: ['memberId']
      })
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'idx_payments_gym',
        columnNames: ['gymId']
      })
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'idx_payments_stripe',
        columnNames: ['stripePaymentIntentId']
      })
    );

    // Create CHECK_INS table
    await queryRunner.createTable(
      new Table({
        name: 'check_ins',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          { name: 'memberId', type: 'uuid' },
          { name: 'gymId', type: 'uuid' },
          {
            name: 'method',
            type: 'varchar',
            length: '20',
            enum: ['qr_code', 'manual', 'app', 'card']
          },
          {
            name: 'checkInTime',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          },
          { name: 'checkOutTime', type: 'timestamptz', isNullable: true },
          { name: 'bookingId', type: 'uuid', isNullable: true },
          { name: 'deviceInfo', type: 'varchar', length: '255', isNullable: true },
          { name: 'staffId', type: 'uuid', isNullable: true }
        ],
        foreignKeys: [
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
          },
          {
            columnNames: ['bookingId'],
            referencedTableName: 'bookings',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL'
          },
          {
            columnNames: ['staffId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL'
          }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'check_ins',
      new TableIndex({
        name: 'idx_checkins_member',
        columnNames: ['memberId']
      })
    );

    await queryRunner.createIndex(
      'check_ins',
      new TableIndex({
        name: 'idx_checkins_gym_time',
        columnNames: ['gymId', 'checkInTime']
      })
    );

    await queryRunner.createIndex(
      'check_ins',
      new TableIndex({
        name: 'idx_checkins_date',
        columnNames: ['checkInTime']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('check_ins', true);
    await queryRunner.dropTable('payments', true);
    await queryRunner.dropTable('waitlist_entries', true);
    await queryRunner.dropTable('bookings', true);
  }
}
