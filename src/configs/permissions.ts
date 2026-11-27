export const PERMISSIONS = {
  ACCESS_TECHNICAL_SERVICE: 'ACCESS_TECHNICAL_SERVICE',
  MANAGE_TECHNICAL_AI: 'MANAGE_TECHNICAL_AI',

  READ_CHATS: 'READ_CHATS',
  SEND_CHAT_MESSAGE: 'SEND_CHAT_MESSAGE',
  ASSIGN_CONVERSATION: 'ASSIGN_CONVERSATION',
  RESOLVE_CONVERSATION: 'RESOLVE_CONVERSATION',

  VIEW_EQUIPMENT: 'VIEW_EQUIPMENT',
  MANAGE_EQUIPMENT: 'MANAGE_EQUIPMENT',

  CREATE_TICKET: 'CREATE_TICKET',
  UPDATE_TICKET: 'UPDATE_TICKET',

  MANAGE_WHATSAPP_CONFIG: 'MANAGE_WHATSAPP_CONFIG',
  MANAGE_USERS_ROLES: 'MANAGE_USERS_ROLES',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS'
} as const

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const TECHNICAL_SERVICE_BUNDLE: PermissionCode[] = [
  PERMISSIONS.ACCESS_TECHNICAL_SERVICE,
  PERMISSIONS.MANAGE_TECHNICAL_AI,
  PERMISSIONS.READ_CHATS,
  PERMISSIONS.SEND_CHAT_MESSAGE,
  PERMISSIONS.ASSIGN_CONVERSATION,
  PERMISSIONS.RESOLVE_CONVERSATION,
  PERMISSIONS.VIEW_EQUIPMENT,
  PERMISSIONS.MANAGE_EQUIPMENT,
  PERMISSIONS.CREATE_TICKET,
  PERMISSIONS.UPDATE_TICKET
]

export const TECHNICAL_CHAT_PERMISSIONS: PermissionCode[] = [
  PERMISSIONS.READ_CHATS,
  PERMISSIONS.SEND_CHAT_MESSAGE,
  PERMISSIONS.ASSIGN_CONVERSATION,
  PERMISSIONS.RESOLVE_CONVERSATION
]

export const TECHNICAL_TICKET_PERMISSIONS: PermissionCode[] = [
  PERMISSIONS.VIEW_EQUIPMENT,
  PERMISSIONS.MANAGE_EQUIPMENT,
  PERMISSIONS.CREATE_TICKET,
  PERMISSIONS.UPDATE_TICKET
]

export const ROLE_DEFAULT_PERMISSIONS: Record<'ADMIN' | 'TECHNICIAN' | 'AGENT', PermissionCode[]> = {
  ADMIN: Object.values(PERMISSIONS),
  TECHNICIAN: [...TECHNICAL_SERVICE_BUNDLE],
  AGENT: [
    PERMISSIONS.ACCESS_TECHNICAL_SERVICE,
    PERMISSIONS.READ_CHATS,
    PERMISSIONS.SEND_CHAT_MESSAGE,
    PERMISSIONS.RESOLVE_CONVERSATION,
    PERMISSIONS.VIEW_EQUIPMENT,
    PERMISSIONS.CREATE_TICKET
  ]
}

export const PERMISSION_LABELS: Record<string, string> = {
  ACCESS_TECHNICAL_SERVICE: 'Acceso Servicio Técnico',
  MANAGE_TECHNICAL_AI: 'Entrenar / Configurar IA Técnica',
  READ_CHATS: 'Ver Chats de IA',
  SEND_CHAT_MESSAGE: 'Responder Chats de WhatsApp',
  ASSIGN_CONVERSATION: 'Asignar Conversaciones',
  RESOLVE_CONVERSATION: 'Cerrar Conversaciones',
  VIEW_EQUIPMENT: 'Ver Equipos y Máquinas',
  MANAGE_EQUIPMENT: 'Gestionar Equipos',
  CREATE_TICKET: 'Crear Tickets',
  UPDATE_TICKET: 'Actualizar Tickets',
  MANAGE_WHATSAPP_CONFIG: 'Configurar WhatsApp y ERP',
  MANAGE_USERS_ROLES: 'Administrar Usuarios y Permisos',
  VIEW_AUDIT_LOGS: 'Ver Auditoría'
}

export function getPermissionModuleBadges(permissions: string[] = [], role?: string) {
  if (role === 'SUPER_ADMIN') {
    return [{ label: 'Acceso Total', color: 'error' as const }]
  }

  const badges: Array<{ label: string; color: 'primary' | 'success' | 'warning' | 'info' | 'secondary' }> = []

  const hasTechModule =
    permissions.includes(PERMISSIONS.ACCESS_TECHNICAL_SERVICE) ||
    permissions.includes(PERMISSIONS.READ_CHATS) ||
    permissions.includes(PERMISSIONS.CREATE_TICKET) ||
    permissions.includes(PERMISSIONS.UPDATE_TICKET)

  if (hasTechModule) {
    badges.push({ label: 'Servicio Técnico', color: 'warning' })
  }

  if (permissions.includes(PERMISSIONS.MANAGE_TECHNICAL_AI)) {
    badges.push({ label: 'IA Técnica', color: 'primary' })
  }

  if (permissions.includes(PERMISSIONS.MANAGE_USERS_ROLES) || permissions.includes(PERMISSIONS.MANAGE_WHATSAPP_CONFIG)) {
    badges.push({ label: 'Admin', color: 'info' })
  }

  if (badges.length === 0) {
    badges.push({ label: 'Sin módulos asignados', color: 'secondary' })
  }

  return badges
}
