export interface ChatMessage {
  id: string
  senderType: 'CUSTOMER' | 'BOT' | 'AGENT' | 'SYSTEM'
  senderName: string
  content: string
  time: string
}

export interface TicketInfo {
  id: string
  title: string
  serviceType: 'ONSITE_PHYSICAL' | 'REMOTE_WHATSAPP'
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  serviceOrderNumber?: string
  aiDiagnostic: string
}

export interface EquipmentInfo {
  id?: string
  name: string
  brandModel: string
  serialNumber: string
  lastMaintenance?: string
  status: 'OPERATIONAL' | 'IN_INCIDENCE'
}

export interface ConversationItem {
  id: string
  customer: {
    id?: string
    name: string
    company: string
    phone: string
    address: string
    initials: string
  }
  status: 'BOT_HANDLING' | 'WAITING_AGENT' | 'AGENT_HANDLING' | 'RESOLVED'
  assignedUser: {
    id: string
    name: string
    role: string
  } | null
  ticket: TicketInfo | null
  equipments: EquipmentInfo[]
  messages: ChatMessage[]
  lastMessageTime: string
  lastMessagePreview: string
}
