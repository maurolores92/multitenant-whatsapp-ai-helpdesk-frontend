import { AbilityBuilder, Ability } from '@casl/ability'
import { PERMISSIONS } from './permissions'

export type Subjects = string
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'

export type AppAbility = Ability<[Actions, Subjects]> | undefined

export const AppAbility = Ability as any
export type ACLObj = {
  action: Actions
  subject: string
}

const defineRulesFor = (role: string, subject: string, permissions?: string[]) => {
  const { can, rules } = new AbilityBuilder(AppAbility)
  const hasExplicitPermissions = Array.isArray(permissions)
  const perms = hasExplicitPermissions ? permissions : []

  if (role === 'SUPER_ADMIN') {
    can('manage', 'all')
  } else if (role === 'ADMIN' || role === 'TECHNICIAN' || role === 'AGENT') {
    if (role === 'ADMIN') {
      can('manage', 'dashboard')
    } else {
      can('read', 'dashboard')
    }

    if (!hasExplicitPermissions) {
      // Compatibilidad si la sesión aún no recibió arreglo de permisos
      can('manage', 'chat')
      can('manage', 'tickets')
      if (role === 'ADMIN' || role === 'TECHNICIAN') {
        can('manage', 'technical-ai')
      }
      if (role === 'ADMIN') {
        can('manage', 'users')
      }
    } else {
      const hasTechnicalService = perms.includes(PERMISSIONS.ACCESS_TECHNICAL_SERVICE)
      const hasChats = hasTechnicalService || perms.includes(PERMISSIONS.READ_CHATS)
      const hasTickets =
        hasTechnicalService ||
        perms.includes(PERMISSIONS.READ_CHATS) ||
        perms.includes(PERMISSIONS.CREATE_TICKET) ||
        perms.includes(PERMISSIONS.UPDATE_TICKET)

      if (hasChats) {
        can('manage', 'chat')
      }
      if (hasTickets) {
        can('manage', 'tickets')
      }
      if (perms.includes(PERMISSIONS.MANAGE_TECHNICAL_AI)) {
        can('manage', 'technical-ai')
      }
      if (role === 'ADMIN' || perms.includes(PERMISSIONS.MANAGE_USERS_ROLES)) {
        can('manage', 'users')
      }
    }

    can('read', 'acl-page')
  } else {
    can(['read', 'create', 'update', 'delete'], subject)
  }

  return rules
}

export const buildAbilityFor = (role: string, subject: string, permissions?: string[]): AppAbility => {
  return new AppAbility(defineRulesFor(role, subject, permissions), {
    // @ts-ignore
    detectSubjectType: object => object!.type
  })
}

export const defaultACLObj: ACLObj = {
  action: 'read',
  subject: 'dashboard'
}

export default defineRulesFor
