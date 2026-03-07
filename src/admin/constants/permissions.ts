export type AdminRole = 'owner' | 'manager' | 'staff';

export interface AdminUser {
  id: string;
  username: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** 每角色可存取的路由 path 陣列 */
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  owner: ['orders', 'analytics', 'menu', 'tables', 'qrcode', 'accounts'],
  manager: ['orders', 'menu', 'tables', 'qrcode'],
  staff: ['orders', 'tables'],
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  owner: '老闆',
  manager: '店長',
  staff: '員工',
};

export function hasPermission(role: AdminRole, path: string): boolean {
  return ROLE_PERMISSIONS[role].includes(path);
}

export function getDefaultPage(role: AdminRole): string {
  return '/admin/' + ROLE_PERMISSIONS[role][0];
}
