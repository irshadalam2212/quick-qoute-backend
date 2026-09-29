export const UserRoles = {
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  MEMBER: "member",
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export const AvailableUser: UserRole[] = Object.values(UserRoles);
