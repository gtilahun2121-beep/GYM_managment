import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymEntity } from './entities/gym.entity';
import { GymsService } from './gyms.service';
import { GymsController } from './gyms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GymEntity])],
  controllers: [GymsController],
  providers: [GymsService],
  exports: [GymsService]
})
export class GymsModule {}
