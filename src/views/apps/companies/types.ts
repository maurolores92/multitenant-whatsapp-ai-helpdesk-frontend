export interface TenantUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt?: string
}

export interface TenantItem {
  id: string
  name: string
  slug: string
  isActive: boolean
  whatsappPhone?: string
  whatsappPhoneNumberId?: string
  whatsappWabaId?: string
  whatsappAccessToken?: string
  whatsappStatus: string
  geminiApiKey?: string
  geminiModel?: string
  aiTemperature?: number
  aiSystemPrompt?: string
  aiEnabled?: boolean
  createdAt: string
  _count: {
    users: number
    customers: number
    tickets: number
    conversations: number
    aiRules?: number
    aiKnowledgeItems?: number
  }
  users: TenantUser[]
}

export type AiRuleCategory = 'TONE' | 'RESTRICTION' | 'BUSINESS' | 'ESCALATION'

export interface AiRuleItem {
  id: string
  tenantId: string
  title: string
  instruction: string
  category: AiRuleCategory
  priority: number
  isActive: boolean
}

export interface AiKnowledgeItem {
  id: string
  tenantId: string
  question: string
  answer: string
  tags: string[]
  isActive: boolean
}

export interface AiExampleItem {
  id: string
  tenantId: string
  customerInput: string
  idealResponse: string
  topic?: string | null
  isApproved: boolean
}
