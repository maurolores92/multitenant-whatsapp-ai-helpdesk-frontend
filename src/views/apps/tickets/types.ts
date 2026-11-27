export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_PARTS'
  | 'WORKSHOP'
  | 'SCHEDULED_VISIT'
  | 'RESOLVED'
  | 'CANCELLED'

export type TicketSource = 'AI_WHATSAPP' | 'WHATSAPP_AGENT' | 'MANUAL_INTERNAL'

export type TicketReason =
  | 'MECHANICAL_FAILURE'
  | 'ELECTRICAL_ERROR'
  | 'TONER_SUPPLIES'
  | 'CALIBRATION_SOFTWARE'
  | 'PREVENTIVE_MAINTENANCE'
  | 'ADMINISTRATIVE'
  | 'OTHER'

export type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type TicketServiceType = 'ONSITE_PHYSICAL' | 'REMOTE_WHATSAPP'

export interface CatalogEquipment {
  id: string
  name: string
  brand?: string | null
  model?: string | null
  serialNumber?: string | null
  clientCode?: string | null
  status?: string
}

export interface CatalogCustomer {
  id: string
  name: string
  companyName?: string | null
  phone: string
  address?: string | null
  locality?: string | null
  externalCode?: string | null
  equipments: CatalogEquipment[]
}

export interface CatalogProblemType {
  id: string
  externalCode?: string | null
  name: string
  description?: string | null
  defaultReason: TicketReason
  defaultServiceType: TicketServiceType
}

export interface TicketItem {
  id: string
  rawId?: string
  title: string
  description?: string
  customerId?: string
  customerName: string
  companyName: string
  customerCode?: string
  phone: string
  address: string
  equipmentId?: string
  equipmentName: string
  equipmentModel: string
  equipmentSn: string
  serviceType: TicketServiceType
  priority: TicketPriority
  status: TicketStatus
  source: TicketSource
  reason: TicketReason
  problemTypeId?: string
  problemTypeName?: string
  serviceOrderNumber?: string
  scheduledDate?: string
  aiDiagnostic: string
  time: string
  resolutionNotes?: string
}

export const TICKET_STATUS_META: Record<
  TicketStatus,
  { label: string; color: 'warning' | 'info' | 'primary' | 'secondary' | 'error' | 'success' }
> = {
  OPEN: { label: 'Pendiente', color: 'warning' },
  ASSIGNED: { label: 'Asignado', color: 'info' },
  IN_PROGRESS: { label: 'En Atención', color: 'primary' },
  WAITING_PARTS: { label: 'Esp. Repuestos', color: 'error' },
  WORKSHOP: { label: 'En Taller', color: 'secondary' },
  SCHEDULED_VISIT: { label: 'Visita Programada', color: 'info' },
  RESOLVED: { label: 'Resuelto', color: 'success' },
  CANCELLED: { label: 'Cancelado', color: 'secondary' }
}

export const TICKET_REASON_META: Record<
  TicketReason,
  { label: string; color: 'error' | 'warning' | 'info' | 'primary' | 'success' | 'secondary' }
> = {
  MECHANICAL_FAILURE: { label: 'Falla Mecánica / Atasco', color: 'error' },
  ELECTRICAL_ERROR: { label: 'Error Eléctrico / Código', color: 'warning' },
  TONER_SUPPLIES: { label: 'Tóner / Insumos', color: 'info' },
  CALIBRATION_SOFTWARE: { label: 'Configuración / Red', color: 'primary' },
  PREVENTIVE_MAINTENANCE: { label: 'Mantenimiento Prev.', color: 'success' },
  ADMINISTRATIVE: { label: 'Administrativo', color: 'secondary' },
  OTHER: { label: 'Otro Motivo', color: 'secondary' }
}

export const TICKET_SOURCE_META: Record<
  TicketSource,
  { label: string; icon: string; color: 'info' | 'success' | 'primary' }
> = {
  AI_WHATSAPP: { label: 'IA WhatsApp', icon: 'tabler:robot', color: 'info' },
  WHATSAPP_AGENT: { label: 'Chat Operador', icon: 'tabler:brand-whatsapp', color: 'success' },
  MANUAL_INTERNAL: { label: 'Interno ERP', icon: 'tabler:clipboard-plus', color: 'primary' }
}
