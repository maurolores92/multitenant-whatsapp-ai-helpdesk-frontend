export interface TenantUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  useCustomPermissions?: boolean
  permissions?: string[]
  createdAt?: string
}

export interface TenantItem {
  id: string
  name: string
  slug: string
  isActive: boolean
  isSystem?: boolean
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

export type AgentArea = 'TECHNICAL_SERVICE' | 'ACCOUNTING' | 'GENERAL'

export interface WhatsAppAgentItem {
  id: string
  tenantId: string
  code: string
  name: string
  area: AgentArea
  isActive: boolean
  isDefault: boolean
  whatsappPhone?: string | null
  whatsappPhoneNumberId?: string | null
  whatsappWabaId?: string | null
  whatsappAccessToken?: string | null
  hasWhatsAppToken?: boolean
  whatsappStatus: string
  geminiModel?: string
  aiTemperature?: number
  aiSystemPrompt?: string | null
  aiEnabled: boolean
  _count?: {
    conversations: number
    tickets: number
    aiRules: number
    aiKnowledgeItems: number
    aiTrainingExamples: number
  }
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
