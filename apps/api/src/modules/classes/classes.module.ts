import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassTypeEntity } from './entities/class-type.entity';
import { RoomEntity } from './entities/room.entity';
import { ClassSessionEntity } from './entities/class-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassTypeEntity, RoomEntity, ClassSessionEntity])
  ]
})
export class ClassesModule {}
