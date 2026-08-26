import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from './entities/member.entity';
import { MembershipPlanEntity } from './entities/membership-plan.entity';
import { MembershipSubscriptionEntity } from './entities/membership-subscription.entity';
import { MembersService } from './services/members.service';
import { MembersController } from './members.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemberEntity,
      MembershipPlanEntity,
      MembershipSubscriptionEntity
    ])
  ],
  providers: [MembersService],
  controllers: [MembersController],
  exports: [MembersService]
})
export class MembersModule {}
