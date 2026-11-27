import { AbilityBuilder, Ability } from '@casl/ability'

export type Subjects = string
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'

export type AppAbility = Ability<[Actions, Subjects]> | undefined

export const AppAbility = Ability as any
export type ACLObj = {
  action: Actions
  subject: string
}

const defineRulesFor = (role: string, subject: string, permissions: string[] = []) => {
  const { can, rules } = new AbilityBuilder(AppAbility)

  if (role === 'SUPER_ADMIN') {
    can('manage', 'companies')
    can('manage', 'users')
    can('read', 'acl-page')
  } else if (role === 'ADMIN') {
    can('manage', 'dashboard')
    can('manage', 'chat')
    can('manage', 'tickets')
    can('manage', 'users')
    can('read', 'acl-page')
  } else if (role === 'TECHNICIAN' || role === 'AGENT') {
    can('read', 'dashboard')
    if (permissions.length === 0 || permissions.includes('READ_CHATS')) {
      can('manage', 'chat')
      can('manage', 'tickets')
    }
    can('read', 'acl-page')
  } else {
    can(['read', 'create', 'update', 'delete'], subject)
  }

  return rules
}

export const buildAbilityFor = (role: string, subject: string, permissions: string[] = []): AppAbility => {
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
