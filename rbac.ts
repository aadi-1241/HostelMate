export type UserRole = "super_admin" | "warden" | "accountant" | "student";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 4,
  warden: 3,
  accountant: 2,
  student: 1,
};

export const PAGE_ROLES: Record<string, UserRole[]> = {
  "/": ["super_admin", "warden", "accountant", "student"],
  "/hostels": ["super_admin", "warden"],
  "/inventory": ["super_admin", "warden"],
  "/students": ["super_admin", "warden", "accountant"],
  "/allocations": ["super_admin", "warden"],
  "/settings": ["super_admin"],
};

export const MENU_ITEMS: Array<{
  label: string;
  path: string;
  roles: UserRole[];
}> = [
  { label: "Dashboard", path: "/", roles: ["super_admin", "warden", "accountant", "student"] },
  { label: "Hostels", path: "/hostels", roles: ["super_admin", "warden"] },
  { label: "Inventory", path: "/inventory", roles: ["super_admin", "warden"] },
  { label: "Students", path: "/students", roles: ["super_admin", "warden", "accountant"] },
  { label: "Allocations", path: "/allocations", roles: ["super_admin", "warden"] },
  { label: "Settings", path: "/settings", roles: ["super_admin"] },
];

export function canAccessPage(userRole: UserRole | undefined, pagePath: string): boolean {
  if (!userRole) return false;
  const allowedRoles = PAGE_ROLES[pagePath];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
}

export function getVisibleMenuItems(userRole: UserRole | undefined) {
  if (!userRole) return [];
  return MENU_ITEMS.filter(item => item.roles.includes(userRole));
}
