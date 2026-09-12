import { UserRole } from "@prisma/client";

type Permission =
  | "user:read"
  | "user:update"
  | "user:delete"
  | "user:ban"
  | "channel:create"
  | "channel:read"
  | "channel:update"
  | "channel:delete"
  | "channel:manage"
  | "video:create"
  | "video:read"
  | "video:update"
  | "video:delete"
  | "video:publish"
  | "video:feature"
  | "video:monetize"
  | "comment:create"
  | "comment:read"
  | "comment:update"
  | "comment:delete"
  | "comment:moderate"
  | "live:create"
  | "live:read"
  | "live:moderate"
  | "podcast:create"
  | "podcast:read"
  | "podcast:update"
  | "podcast:delete"
  | "article:create"
  | "article:read"
  | "article:update"
  | "article:delete"
  | "article:publish"
  | "media:upload"
  | "media:read"
  | "media:delete"
  | "donation:create"
  | "donation:read"
  | "donation:manage"
  | "analytics:read"
  | "analytics:export"
  | "monetization:manage"
  | "brand:manage"
  | "ad:manage"
  | "revenue:read"
  | "notification:read"
  | "notification:manage"
  | "report:create"
  | "report:read"
  | "report:resolve"
  | "audit:read"
  | "settings:read"
  | "settings:manage"
  | "user:admin"
  | "channel:admin"
  | "content:admin"
  | "platform:admin";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  USER: [
    "user:read",
    "user:update",
    "channel:create",
    "channel:read",
    "channel:update",
    "video:create",
    "video:read",
    "video:update",
    "video:delete",
    "comment:create",
    "comment:read",
    "comment:update",
    "comment:delete",
    "live:create",
    "live:read",
    "podcast:create",
    "podcast:read",
    "podcast:update",
    "podcast:delete",
    "article:create",
    "article:read",
    "article:update",
    "article:delete",
    "media:upload",
    "media:read",
    "media:delete",
    "donation:create",
    "donation:read",
    "notification:read",
    "notification:manage",
    "report:create",
  ],
  CREATOR: [
    "user:read",
    "user:update",
    "channel:create",
    "channel:read",
    "channel:update",
    "channel:manage",
    "video:create",
    "video:read",
    "video:update",
    "video:delete",
    "video:publish",
    "video:monetize",
    "comment:create",
    "comment:read",
    "comment:update",
    "comment:delete",
    "comment:moderate",
    "live:create",
    "live:read",
    "podcast:create",
    "podcast:read",
    "podcast:update",
    "podcast:delete",
    "article:create",
    "article:read",
    "article:update",
    "article:delete",
    "article:publish",
    "media:upload",
    "media:read",
    "media:delete",
    "donation:create",
    "donation:read",
    "donation:manage",
    "analytics:read",
    "analytics:export",
    "monetization:manage",
    "brand:manage",
    "ad:manage",
    "revenue:read",
    "notification:read",
    "notification:manage",
    "report:create",
    "report:read",
  ],
  MODERATOR: [
    "user:read",
    "user:update",
    "user:ban",
    "channel:create",
    "channel:read",
    "channel:update",
    "channel:manage",
    "video:create",
    "video:read",
    "video:update",
    "video:delete",
    "video:publish",
    "video:feature",
    "comment:create",
    "comment:read",
    "comment:update",
    "comment:delete",
    "comment:moderate",
    "live:create",
    "live:read",
    "live:moderate",
    "podcast:create",
    "podcast:read",
    "podcast:update",
    "podcast:delete",
    "article:create",
    "article:read",
    "article:update",
    "article:delete",
    "article:publish",
    "media:upload",
    "media:read",
    "media:delete",
    "donation:create",
    "donation:read",
    "donation:manage",
    "analytics:read",
    "analytics:export",
    "monetization:manage",
    "brand:manage",
    "ad:manage",
    "revenue:read",
    "notification:read",
    "notification:manage",
    "report:create",
    "report:read",
    "report:resolve",
    "audit:read",
    "settings:read",
  ],
  ADMIN: [
    "user:read",
    "user:update",
    "user:delete",
    "user:ban",
    "user:admin",
    "channel:create",
    "channel:read",
    "channel:update",
    "channel:delete",
    "channel:manage",
    "channel:admin",
    "video:create",
    "video:read",
    "video:update",
    "video:delete",
    "video:publish",
    "video:feature",
    "video:monetize",
    "video:admin",
    "comment:create",
    "comment:read",
    "comment:update",
    "comment:delete",
    "comment:moderate",
    "live:create",
    "live:read",
    "live:moderate",
    "podcast:create",
    "podcast:read",
    "podcast:update",
    "podcast:delete",
    "article:create",
    "article:read",
    "article:update",
    "article:delete",
    "article:publish",
    "media:upload",
    "media:read",
    "media:delete",
    "donation:create",
    "donation:read",
    "donation:manage",
    "analytics:read",
    "analytics:export",
    "monetization:manage",
    "brand:manage",
    "ad:manage",
    "revenue:read",
    "notification:read",
    "notification:manage",
    "report:create",
    "report:read",
    "report:resolve",
    "audit:read",
    "settings:read",
    "settings:manage",
    "content:admin",
  ],
  SUPER_ADMIN: [
    "user:read",
    "user:update",
    "user:delete",
    "user:ban",
    "user:admin",
    "channel:create",
    "channel:read",
    "channel:update",
    "channel:delete",
    "channel:manage",
    "channel:admin",
    "video:create",
    "video:read",
    "video:update",
    "video:delete",
    "video:publish",
    "video:feature",
    "video:monetize",
    "comment:create",
    "comment:read",
    "comment:update",
    "comment:delete",
    "comment:moderate",
    "live:create",
    "live:read",
    "live:moderate",
    "podcast:create",
    "podcast:read",
    "podcast:update",
    "podcast:delete",
    "article:create",
    "article:read",
    "article:update",
    "article:delete",
    "article:publish",
    "media:upload",
    "media:read",
    "media:delete",
    "donation:create",
    "donation:read",
    "donation:manage",
    "analytics:read",
    "analytics:export",
    "monetization:manage",
    "brand:manage",
    "ad:manage",
    "revenue:read",
    "notification:read",
    "notification:manage",
    "report:create",
    "report:read",
    "report:resolve",
    "audit:read",
    "settings:read",
    "settings:manage",
    "user:admin",
    "channel:admin",
    "content:admin",
    "platform:admin",
  ],
};

const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 0,
  CREATOR: 1,
  MODERATOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function getRoleHierarchy(role: UserRole): number {
  return ROLE_HIERARCHY[role] ?? 0;
}

export function hasRole(currentRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isAtLeast(role: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole];
}

export function canAccessResource(
  userRole: UserRole,
  resourceOwnerId: string,
  userId: string,
  permission: Permission
): boolean {
  if (hasPermission(userRole, permission)) return true;
  if (resourceOwnerId === userId) return true;
  return false;
}

export function canModerateContent(
  userRole: UserRole,
  contentOwnerId: string,
  userId: string
): boolean {
  if (isAtLeast(userRole, "MODERATOR")) return true;
  if (contentOwnerId === userId) return true;
  return false;
}

export function canManageChannel(
  userRole: UserRole,
  channelOwnerId: string,
  userId: string
): boolean {
  if (isAtLeast(userRole, "ADMIN")) return true;
  if (channelOwnerId === userId) return true;
  return false;
}

export function canViewContent(
  userRole: UserRole,
  contentVisibility: string,
  isSubscribed: boolean,
  isPremiumSubscriber: boolean
): boolean {
  if (isAtLeast(userRole, "MODERATOR")) return true;

  switch (contentVisibility) {
    case "PUBLIC":
      return true;
    case "UNLISTED":
      return true;
    case "PRIVATE":
      return false;
    case "SUBSCRIBERS_ONLY":
      return isSubscribed;
    case "PREMIUM_ONLY":
      return isPremiumSubscriber;
    default:
      return false;
  }
}

export function canPublishContent(
  userRole: UserRole,
  channelOwnerId: string,
  userId: string
): boolean {
  if (hasPermission(userRole, "video:publish")) return true;
  if (channelOwnerId === userId && hasRole(userRole, "CREATOR")) return true;
  return false;
}

export function canMonetize(
  userRole: UserRole,
  channelOwnerId: string,
  userId: string
): boolean {
  if (hasPermission(userRole, "video:monetize")) return true;
  if (
    channelOwnerId === userId &&
    isAtLeast(userRole, "CREATOR")
  ) {
    return true;
  }
  return false;
}

export function canAccessAnalytics(
  userRole: UserRole,
  channelOwnerId: string,
  userId: string
): boolean {
  if (isAtLeast(userRole, "ADMIN")) return true;
  if (channelOwnerId === userId) return true;
  return false;
}

export function canExportAnalytics(userRole: UserRole): boolean {
  return hasPermission(userRole, "analytics:export");
}

export function canManageRevenue(userRole: UserRole): boolean {
  return hasPermission(userRole, "revenue:read");
}

export function canResolveReport(userRole: UserRole): boolean {
  return hasPermission(userRole, "report:resolve");
}

export function canManageSettings(userRole: UserRole): boolean {
  return hasPermission(userRole, "settings:manage");
}

export function canAccessAuditLogs(userRole: UserRole): boolean {
  return hasPermission(userRole, "audit:read");
}

export function canBanUser(currentRole: UserRole, targetRole: UserRole): boolean {
  if (!isAtLeast(currentRole, "MODERATOR")) return false;
  return ROLE_HIERARCHY[currentRole] > ROLE_HIERARCHY[targetRole];
}

export function canDeleteUser(currentRole: UserRole, targetRole: UserRole): boolean {
  if (!isAtLeast(currentRole, "ADMIN")) return false;
  return ROLE_HIERARCHY[currentRole] > ROLE_HIERARCHY[targetRole];
}

export function canChangeUserRole(currentRole: UserRole, targetRole: UserRole): boolean {
  if (!isAtLeast(currentRole, "ADMIN")) return false;
  return ROLE_HIERARCHY[currentRole] > ROLE_HIERARCHY[targetRole];
}

export function canFeatureContent(userRole: UserRole): boolean {
  return hasPermission(userRole, "video:feature");
}

export function canManageLiveStream(
  userRole: UserRole,
  channelOwnerId: string,
  userId: string
): boolean {
  if (isAtLeast(userRole, "MODERATOR")) return true;
  if (channelOwnerId === userId) return true;
  return false;
}

export function canModerateChat(userRole: UserRole): boolean {
  return isAtLeast(userRole, "MODERATOR");
}

export function canSendSuperChat(
  userRole: UserRole,
  amount: number
): boolean {
  if (!isAtLeast(userRole, "CREATOR")) return false;
  if (amount < 0.5 || amount > 500) return false;
  return true;
}

export function canCreateDonationGoal(
  userRole: UserRole,
  channelOwnerId: string,
  userId: string
): boolean {
  if (channelOwnerId === userId && isAtLeast(userRole, "CREATOR")) return true;
  return false;
}

export function canManageBrandDeal(
  userRole: UserRole,
  channelOwnerId: string,
  userId: string
): boolean {
  if (hasPermission(userRole, "brand:manage")) return true;
  if (channelOwnerId === userId && isAtLeast(userRole, "CREATOR")) return true;
  return false;
}

export function canManageAdCampaign(userRole: UserRole): boolean {
  return hasPermission(userRole, "ad:manage");
}

export { Permission, ROLE_PERMISSIONS, ROLE_HIERARCHY };
