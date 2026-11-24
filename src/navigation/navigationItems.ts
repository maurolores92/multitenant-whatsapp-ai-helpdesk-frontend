export interface NavigationItem {
  title: string;
  path: string;
  iconName: 'Dashboard' | 'WhatsApp' | 'Assignment' | 'PrecisionManufacturing' | 'Settings' | 'Business' | 'People';
  requiredPermission?: string;
  badge?: string;
  superAdminOnly?: boolean;
  adminOnly?: boolean;
  tenantOnly?: boolean;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  // Menú exclusivo de Superadmin
  {
    title: 'Compañías',
    path: '/companies',
    iconName: 'Business',
    superAdminOnly: true,
  },
  // Menú de Empresas / Tenants
  {
    title: 'Dashboard',
    path: '/dashboard',
    iconName: 'Dashboard',
    tenantOnly: true,
  },
  {
    title: 'WhatsApp Chat',
    path: '/chat',
    iconName: 'WhatsApp',
    requiredPermission: 'READ_CHATS',
    tenantOnly: true,
  },
  {
    title: 'Tickets & IA',
    path: '/tickets',
    iconName: 'Assignment',
    requiredPermission: 'READ_CHATS',
    tenantOnly: true,
  },
  {
    title: 'Usuarios',
    path: '/users',
    iconName: 'People',
    adminOnly: true,
    tenantOnly: true,
  },
];
