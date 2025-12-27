import { useAuth } from "./use-auth";
import { type UserRole, canAccessPage, getVisibleMenuItems, PAGE_ROLES } from "@shared/rbac";
import { useLocation } from "wouter";

export function useRBAC() {
  const { user } = useAuth();
  const [location] = useLocation();

  const userRole = (user?.role as UserRole) || undefined;

  return {
    userRole,
    canAccessPage: (path: string) => canAccessPage(userRole, path),
    getVisibleMenuItems: () => getVisibleMenuItems(userRole),
    isCurrentPageAllowed: () => canAccessPage(userRole, location),
    isSuperAdmin: userRole === "super_admin",
    isWarden: userRole === "warden",
    isAccountant: userRole === "accountant",
    isStudent: userRole === "student",
  };
}
