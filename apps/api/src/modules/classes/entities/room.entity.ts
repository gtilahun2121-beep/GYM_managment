import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  ForeignKey
} from 'typeorm';
import { GymEntity } from '../../gyms/entities/gym.entity';
import { ClassSessionEntity } from './class-session.entity';

@Entity('rooms')
export class RoomEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => GymEntity)
  gymId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'integer' })
  capacity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string;

  @Column({ type: 'jsonb', default: '[]' })
  amenities: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => GymEntity, (gym) => gym.rooms, { onDelete: 'CASCADE' })
  gym: GymEntity;

  @OneToMany(() => ClassSessionEntity, (session) => session.room)
  classSessions: ClassSessionEntity[];
}
