import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInEntity } from './entities/check-in.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CheckInEntity])]
})
export class CheckInsModule {}
