export interface UserItem {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TECHNICIAN' | 'AGENT'
  isActive: boolean
  useCustomPermissions?: boolean
  permissions?: string[]
  createdAt: string
  tenantId?: string
  tenant?: {
    id: string
    name: string
    slug: string
  }
}
