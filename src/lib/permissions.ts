import { MembershipRole } from '@/types';

/**
 * Returns true if a user role satisfies the required minimum role.
 * Roles are ordered from least to most privileged: member < mod < admin < owner.
 */
export function hasRole(userRole: MembershipRole, required: MembershipRole): boolean {
  const order: Record<MembershipRole, number> = {
    member: 0,
    mod: 1,
    admin: 2,
    owner: 3,
  };
  return order[userRole] >= order[required];
}