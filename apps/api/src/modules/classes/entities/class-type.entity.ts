import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  ForeignKey
} from 'typeorm';
import { GymEntity } from '../../gyms/entities/gym.entity';
import { ClassSessionEntity } from './class-session.entity';
import { IntensityLevel } from '@gym/shared-types';

@Entity('class_types')
@Index('idx_class_types_gym', ['gymId'])
export class ClassTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => GymEntity)
  gymId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'integer', default: 60 })
  durationMinutes: number;

  @Column({
    type: 'varchar',
    length: 20,
    enum: [IntensityLevel.LOW, IntensityLevel.MODERATE, IntensityLevel.HIGH, IntensityLevel.EXTREME]
  })
  intensityLevel: IntensityLevel;

  @Column({ type: 'integer', default: 20 })
  maxCapacity: number;

  @Column({ type: 'varchar', length: 7, default: '#3B82F6' })
  colorCode: string;

  @Column({ type: 'jsonb', default: '[]' })
  equipmentNeeded: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => GymEntity, (gym) => gym.classTypes, { onDelete: 'CASCADE' })
  gym: GymEntity;

  @OneToMany(() => ClassSessionEntity, (session) => session.classType)
  sessions: ClassSessionEntity[];
}
