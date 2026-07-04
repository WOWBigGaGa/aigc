import { IdentityTypeEnum } from '@app-types/models/account.types';
import { UsecaseSession } from '@app-types/auth/session.types';
import { hasRole } from '@core/account/policy/role-access.policy';

export function isAdmin(session: UsecaseSession): boolean {
  return hasRole(session.roles, IdentityTypeEnum.ADMIN);
}

export function isStaff(session: UsecaseSession): boolean {
  return hasRole(session.roles, IdentityTypeEnum.STAFF);
}

export function isAdminOrStaff(session: UsecaseSession): boolean {
  return isAdmin(session) || isStaff(session);
}

export function canManageArticle(session: UsecaseSession, authorId: string): boolean {
  if (isAdmin(session)) return true;
  return session.accountId === Number(authorId);
}

export function canManageCategory(session: UsecaseSession): boolean {
  return isAdminOrStaff(session);
}

export function canManageTag(session: UsecaseSession): boolean {
  return isAdminOrStaff(session);
}

export function canManageComment(session: UsecaseSession): boolean {
  return isAdminOrStaff(session);
}

export function canCreateComment(session: UsecaseSession): boolean {
  return session.roles.length > 0;
}
