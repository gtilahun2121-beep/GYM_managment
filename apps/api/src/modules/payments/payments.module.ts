import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])]
})
export class PaymentsModule {}
