/**
 * Example usage of authentication and authorization in the Gym Management System
 *
 * This file demonstrates how to use the auth guards, decorators, and permissions
 * throughout your application.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ForbiddenException
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser, type CurrentUser as CurrentUserType } from './decorators/current-user.decorator';
import { UserRole } from '@gym/shared-types';
import { hasPermission, hasAnyPermission } from './permissions';

@ApiTags('Example: Authentication & Authorization')
@Controller('example')
export class AuthExampleController {
  /**
   * Public endpoint - no auth required
   */
  @Get('public')
  public() {
    return { message: 'This endpoint is public' };
  }

  /**
   * Authenticated endpoint - JWT required
   */
  @Get('authenticated')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  authenticated(@CurrentUser() user: CurrentUserType) {
    return {
      message: 'You are authenticated',
      user: {
        id: user.userId,
        email: user.email,
        role: user.role
      }
    };
  }

  /**
   * Admin only endpoint - requires specific role
   */
  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_MANAGER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  adminOnly(@CurrentUser() user: CurrentUserType) {
    return {
      message: 'Only admins can see this',
      user: user.email
    };
  }

  /**
   * Trainer endpoint - access based on role
   */
  @Get('trainer-classes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER)
  @ApiBearerAuth()
  trainerClasses(@CurrentUser() user: CurrentUserType) {
    return {
      message: 'Trainer-only classes endpoint',
      trainerId: user.userId
    };
  }

  /**
   * Member endpoint - members and admins can access
   */
  @Get('my-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER, UserRole.TRAINER)
  @ApiBearerAuth()
  myProfile(@CurrentUser() user: CurrentUserType) {
    return {
      message: 'Your profile data',
      userId: user.userId,
      role: user.role
    };
  }

  /**
   * Conditional access based on permissions
   */
  @Get('permissions-example')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  permissionsExample(@CurrentUser() user: CurrentUserType) {
    const role = user.role as UserRole;

    // Check single permission
    if (hasPermission(role, 'payments:refund')) {
      return {
        message: 'You can refund payments'
      };
    }

    // Check any permission
    if (hasAnyPermission(role, ['payments:read', 'payments:*'])) {
      return {
        message: 'You can view payments'
      };
    }

    throw new ForbiddenException('You do not have permission to access this resource');
  }

  /**
   * Example: Restrict data based on gym membership
   */
  @Get('gym/:gymId/members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_MANAGER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  gymMembers(
    @Param('gymId') gymId: string,
    @CurrentUser() user: CurrentUserType
  ) {
    // Super admin can access any gym
    if (user.role === UserRole.SUPER_ADMIN) {
      return {
        message: 'Super admin accessing members',
        gymId
      };
    }

    // Gym manager can only access their own gym
    if (user.gymId !== gymId) {
      throw new ForbiddenException(
        'You can only access members from your own gym'
      );
    }

    return {
      message: 'Gym manager accessing own gym members',
      gymId,
      managerId: user.userId
    };
  }

  /**
   * Example: Multi-level access control
   */
  @Get('bookings/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  viewBooking(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: CurrentUserType
  ) {
    // In a real scenario, fetch the booking from database
    const booking = {
      id: bookingId,
      memberId: 'some-member-id',
      managerId: 'some-manager-id'
    };

    const role = user.role as UserRole;

    // Super admin can see any booking
    if (role === UserRole.SUPER_ADMIN) {
      return { message: 'Super admin viewing booking', booking };
    }

    // Gym manager can see bookings from their gym
    if (role === UserRole.GYM_MANAGER) {
      // In real code, verify gym_id matches
      return { message: 'Gym manager viewing booking', booking };
    }

    // Member can only see their own booking
    if (role === UserRole.MEMBER && user.userId === booking.memberId) {
      return { message: 'Member viewing own booking', booking };
    }

    // Trainer can see bookings for their classes
    if (role === UserRole.TRAINER) {
      // In real code, verify trainer teaches this class
      return { message: 'Trainer viewing class booking', booking };
    }

    throw new ForbiddenException(
      'You do not have permission to view this booking'
    );
  }

  /**
   * Example: Role-based operation
   */
  @Post('refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_MANAGER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  processRefund(
    @Body() body: { paymentId: string; amount: number },
    @CurrentUser() user: CurrentUserType
  ) {
    const role = user.role as UserRole;

    // Check permission before processing
    if (!hasPermission(role, 'payments:refund')) {
      throw new ForbiddenException('You cannot process refunds');
    }

    return {
      message: 'Refund processed',
      processedBy: user.email,
      paymentId: body.paymentId,
      amount: body.amount
    };
  }
}

/**
 * IMPORTANT PATTERNS TO FOLLOW:
 *
 * 1. Public Endpoints
 *    - No guards needed
 *    - Available to everyone
 *
 * 2. Authenticated Endpoints
 *    - Use @UseGuards(JwtAuthGuard)
 *    - Require valid JWT token
 *    - Access @CurrentUser() for user details
 *
 * 3. Role-Based Endpoints
 *    - Use @UseGuards(JwtAuthGuard, RolesGuard)
 *    - Use @Roles(UserRole.ADMIN, ...) decorator
 *    - Specify allowed roles
 *
 * 4. Permission-Based Endpoints
 *    - Use @UseGuards(JwtAuthGuard)
 *    - Check hasPermission(role, action) in controller
 *    - Throw ForbiddenException if denied
 *
 * 5. Data Isolation
 *    - Always verify gym_id matches user's gym
 *    - Super admins can bypass gym restrictions
 *    - Members can only access own data
 *
 * 6. Audit Trail
 *    - Log all sensitive operations with user email
 *    - Include timestamp and operation details
 *    - Consider compliance requirements (GDPR, etc.)
 */
