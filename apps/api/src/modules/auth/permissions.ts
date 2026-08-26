import { UserRole } from '@gym/shared-types';

/**
 * Permission mapping: Role -> Allowed actions
 * Use this to define what each role can do
 */
export const PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Full system access
    'users:*',
    'gyms:*',
    'members:*',
    'classes:*',
    'bookings:*',
    'payments:*',
    'checkins:*',
    'analytics:*',
    'admin:*'
  ],

  [UserRole.GYM_MANAGER]: [
    // Manage own gym
    'gyms:read',
    'gyms:update',
    'users:read',
    'users:create',
    'users:update',
    'members:*',
    'classes:*',
    'bookings:read',
    'payments:read',
    'payments:refund',
    'checkins:read',
    'analytics:*',
    'admin:read'
  ],

  [UserRole.RECEPTIONIST]: [
    // Front desk operations
    'members:read',
    'members:update',
    'bookings:read',
    'bookings:create',
    'bookings:cancel',
    'checkins:create',
    'checkins:read',
    'classes:read'
  ],

  [UserRole.TRAINER]: [
    // Trainer/coach operations
    'members:read',
    'classes:read',
    'classes:update-own',
    'bookings:read',
    'checkins:read',
    'workouts:read',
    'workouts:create',
    'workouts:update-own',
    'progress:read',
    'progress:create'
  ],

  [UserRole.MEMBER]: [
    // Member self-service
    'profile:read',
    'profile:update-own',
    'classes:read',
    'bookings:read',
    'bookings:create',
    'bookings:cancel-own',
    'payments:read',
    'workouts:read',
    'progress:read',
    'progress:create-own'
  ]
};

/**
 * Check if a role has permission for an action
 */
export function hasPermission(role: UserRole, action: string): boolean {
  const permissions = PERMISSIONS[role] || [];

  // Check exact match
  if (permissions.includes(action)) {
    return true;
  }

  // Check wildcard matches
  const actionPrefix = action.split(':')[0];
  if (permissions.includes(`${actionPrefix}:*`)) {
    return true;
  }

  // Check full wildcard
  if (permissions.includes('*')) {
    return true;
  }

  return false;
}

/**
 * Check if a role can perform any of the given actions
 */
export function hasAnyPermission(role: UserRole, actions: string[]): boolean {
  return actions.some((action) => hasPermission(role, action));
}

/**
 * Check if a role can perform all of the given actions
 */
export function hasAllPermissions(role: UserRole, actions: string[]): boolean {
  return actions.every((action) => hasPermission(role, action));
}
