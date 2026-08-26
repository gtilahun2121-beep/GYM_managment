import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from './entities/booking.entity';
import { WaitlistEntryEntity } from './entities/waitlist-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookingEntity, WaitlistEntryEntity])]
})
export class BookingsModule {}
