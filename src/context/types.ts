export type ErrCallbackType = (err: { [key: string]: string }) => void

export type LoginParams = {
  email: string
  password: string
  rememberMe?: boolean
}

export type TenantSummaryType = {
  id: string
  name: string
  slug: string
  whatsappStatus?: string
  whatsappPhone?: string
  aiEnabled?: boolean
}

export type UserDataType = {
  id: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TECHNICIAN' | 'AGENT' | string
  email: string
  name: string
  fullName?: string
  username?: string
  tenantId?: string | null
  tenant?: TenantSummaryType | null
  permissions?: string[]
  avatar?: string | null
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
}
