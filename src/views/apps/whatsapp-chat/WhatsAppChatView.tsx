// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Hooks & Configs
import api from 'src/configs/api'
import { useAuth } from 'src/hooks/useAuth'
import { useSocket } from 'src/hooks/useSocket'
import { useSettings } from 'src/@core/hooks/useSettings'
import { getInitials } from 'src/@core/utils/get-initials'

// ** Subcomponents & Types
import ChatSidebarLeft from './ChatSidebarLeft'
import ChatMainContent from './ChatMainContent'
import ChatDetailsSidebar from './ChatDetailsSidebar'
import { ServiceOrderDialog } from './ChatModals'
import { ChatMessage, ConversationItem } from './types'

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-1',
    customer: {
      name: 'Roberto Gómez',
      company: 'Sanatorio San Lucas S.R.L.',
      phone: '+54 9 11 4444-2233',
      address: 'Av. Libertador 4200, Piso 3',
      initials: 'RG'
    },
    status: 'WAITING_AGENT',
    assignedUser: null,
    ticket: {
      id: 'TCK-1042',
      title: 'Incidencia WhatsApp: Error E-402 con sobrecalentamiento',
      serviceType: 'ONSITE_PHYSICAL',
      priority: 'HIGH',
      aiDiagnostic:
        'El cliente reportó olor a quemado y fallo tras error E-402. La IA determinó riesgo eléctrico y suspendió el encendido forzado.'
    },
    equipments: [
      {
        name: 'Ecoflex 3000',
        brandModel: 'Sonix Med / ECO-3000',
        serialNumber: 'ECO-9923',
        lastMaintenance: '15/09/2026 (Preventivo)',
        status: 'IN_INCIDENCE'
      },
      {
        name: 'Monitor Multiparamétrico MP-50',
        brandModel: 'Philips / MP-50',
        serialNumber: 'PH-8812',
        status: 'OPERATIONAL'
      }
    ],
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        senderName: 'Roberto Gómez (Cliente)',
        content: 'Hola, el equipo de ecografía Ecoflex 3000 tiró un error E-402 y no enciende la pantalla.',
        time: '14:02'
      },
      {
        id: 'm2',
        senderType: 'BOT',
        senderName: 'Asistente IA Oficial',
        content:
          '¡Hola Roberto! He identificado tu equipo registrado: Ecoflex 3000 (S/N: ECO-9923). ¿Podrías confirmar si la llave térmica posterior está activa?',
        time: '14:02'
      }
    ],
    lastMessageTime: '14:06',
    lastMessagePreview: 'Determinación: Requiere Técnico Físico en Local...'
  }
]

const mapBackendMessage = (m: any, fallbackCustomerName = 'Cliente'): ChatMessage => ({
  id: m.id,
  senderType: m.senderType,
  senderName:
    m.senderType === 'BOT'
      ? 'Asistente IA Oficial'
      : m.senderType === 'SYSTEM'
        ? 'Sistema'
        : m.senderType === 'AGENT'
          ? m.senderUser?.name || 'Operador'
          : fallbackCustomerName,
  content: m.content,
  time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

const WhatsAppChatView = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const { settings } = useSettings()
  const { skin } = settings

  const hidden = useMediaQuery(theme.breakpoints.down('lg'))
  const smAbove = useMediaQuery(theme.breakpoints.up('sm'))
  const mdAbove = useMediaQuery(theme.breakpoints.up('md'))
  const sidebarWidth = smAbove ? 340 : 300

  const [conversations, setConversations] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS)
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [inputMessage, setInputMessage] = useState<string>('')
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(false)

  // Modals
  const [openOrderModal, setOpenOrderModal] = useState<boolean>(false)
  const [serviceOrderInput, setServiceOrderInput] = useState<string>('')
  const [whatsappMessageInput, setWhatsappMessageInput] = useState<string>('')
  const [isSendingOrder, setIsSendingOrder] = useState<boolean>(false)

  const currentUserName = user?.name || 'Operador'
  const currentUserRole = user?.role || 'AGENT'

  const loadConversations = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await api.get('/chat/conversations')
      const data = Array.isArray(res.data) ? res.data : []
      if (data.length > 0) {
        const mapped: ConversationItem[] = data.map((c: any) => {
          const customerName = c.customer?.name || 'Cliente WhatsApp'
          const lastMsg = c.messages?.[0]
          const latestTicket = c.tickets?.[0]

          return {
            id: c.id,
            customer: {
              id: c.customer?.id,
              name: customerName,
              company: c.customer?.companyName || c.customer?.company || customerName,
              phone: c.customer?.phone || '',
              address: c.customer?.address || 'Sin dirección',
              initials: getInitials(customerName)
            },
            status: c.status,
            assignedUser: c.assignedUser || null,
            ticket: latestTicket
              ? {
                id: latestTicket.id,
                title: latestTicket.title,
                serviceType: latestTicket.serviceType,
                priority: latestTicket.priority,
                serviceOrderNumber: latestTicket.serviceOrderNumber,
                aiDiagnostic: latestTicket.aiDiagnostic || ''
              }
              : null,
            equipments: (c.customer?.equipments || []).map((eq: any) => ({
              id: eq.id,
              name: eq.name,
              brandModel: `${eq.brand || ''} ${eq.model || ''}`.trim() || 'Modelo estándar',
              serialNumber: eq.serialNumber || 'S/N',
              status: eq.status || 'OPERATIONAL'
            })),
            messages: lastMsg ? [mapBackendMessage(lastMsg, customerName)] : [],
            lastMessageTime: new Date(c.lastMessageAt || c.updatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            lastMessagePreview: lastMsg?.content || 'Sin mensajes recientes'
          }
        })

        setConversations(mapped)
        setSelectedConvId(prev => (mapped.some(item => item.id === prev) ? prev : mapped[0].id))
      }
    } catch {
      // Mantiene vista inicial si aún no hay conversaciones
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const activeConv = conversations.find(c => c.id === selectedConvId) || conversations[0]

  // Cargar historial completo de la conversación seleccionada desde el backend
  useEffect(() => {
    if (!selectedConvId || selectedConvId.startsWith('conv-')) return

    const loadMessages = async () => {
      try {
        const res = await api.get(`/chat/conversations/${selectedConvId}/messages`)
        const msgs = Array.isArray(res.data) ? res.data : []
        setConversations(prev =>
          prev.map(c =>
            c.id === selectedConvId
              ? { ...c, messages: msgs.map((m: any) => mapBackendMessage(m, c.customer.name)) }
              : c
          )
        )
      } catch { }
    }

    loadMessages()
  }, [selectedConvId])

  // WebSocket en vivo
  useSocket({
    onNewMessage: data => {
      if (!data?.conversationId || !data?.message) return
      const mappedMsg = mapBackendMessage(data.message, data.customer?.name || 'Cliente')
      setConversations(prev =>
        prev.map(c =>
          c.id === data.conversationId
            ? {
              ...c,
              messages: c.messages.some(m => m.id === mappedMsg.id) ? c.messages : [...c.messages, mappedMsg],
              lastMessageTime: mappedMsg.time,
              lastMessagePreview: mappedMsg.content
            }
            : c
        )
      )
    },
    onConversationUpdated: data => {
      if (!data?.conversationId) return
      setConversations(prev =>
        prev.map(c => (c.id === data.conversationId ? { ...c, status: data.status || c.status } : c))
      )
    }
  })

  const handleTakeOver = async () => {
    if (!activeConv) return
    if (!activeConv.id.startsWith('conv-')) {
      await api
        .patch(`/chat/conversations/${activeConv.id}/take-over`)
        .catch(() => toast.error('No se pudo sincronizar el traspaso con el servidor'))
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const systemMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      senderType: 'SYSTEM',
      senderName: 'Sistema',
      content: `${currentUserName} tomó la conversación. La IA se ha silenciado para este chat.`,
      time: now
    }

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? {
            ...c,
            status: 'AGENT_HANDLING',
            assignedUser: { id: user?.id || 'op', name: currentUserName, role: currentUserRole },
            messages: [...c.messages, systemMsg]
          }
          : c
      )
    )
    toast.success('Has tomado el control de la conversación.')
  }

  const handleReleaseToBot = async () => {
    if (!activeConv) return
    if (!activeConv.id.startsWith('conv-')) {
      await api
        .patch(`/chat/conversations/${activeConv.id}/release-to-bot`)
        .catch(() => toast.error('No se pudo devolver la conversación en el servidor'))
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const systemMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      senderType: 'SYSTEM',
      senderName: 'Sistema',
      content: 'La conversación fue devuelta a la IA.',
      time: now
    }

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? { ...c, status: 'BOT_HANDLING', assignedUser: null, messages: [...c.messages, systemMsg] }
          : c
      )
    )
    toast('Conversación devuelta al asistente IA.')
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeConv) return
    const text = inputMessage.trim()
    setInputMessage('')
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newAgentMsg: ChatMessage = {
      id: `agent-${Date.now()}`,
      senderType: 'AGENT',
      senderName: currentUserName,
      content: text,
      time: now
    }

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? {
            ...c,
            status: 'AGENT_HANDLING',
            assignedUser: { id: user?.id || 'op', name: currentUserName, role: currentUserRole },
            messages: [...c.messages, newAgentMsg],
            lastMessageTime: now,
            lastMessagePreview: text
          }
          : c
      )
    )

    if (!activeConv.id.startsWith('conv-')) {
      await api.post(`/chat/conversations/${activeConv.id}/messages`, { content: text }).catch(() => {
        toast.error('Error al enviar mensaje al servidor')
      })
    }
  }

  const buildOrderMessage = (orderNum: string) => {
    if (!activeConv) return ''
    const eqName = activeConv.equipments[0]?.name || 'Equipo General'
    const eqSn = activeConv.equipments[0]?.serialNumber || 'S/N'

    return `Estimado/a ${activeConv.customer.name}, le informamos que se ha generado la *Orden de Servicio N° ${orderNum.trim() || '######'
      }* para la atención técnica de su reclamo sobre el equipo *${eqName}* (S/N: ${eqSn}). Muchas gracias.`
  }

  const handleOpenOrderModal = () => {
    const existing = activeConv?.ticket?.serviceOrderNumber || ''
    setServiceOrderInput(existing)
    setWhatsappMessageInput(buildOrderMessage(existing))
    setOpenOrderModal(true)
  }

  const handleSendOrderToWhatsApp = async () => {
    if (!activeConv || !serviceOrderInput.trim()) return
    setIsSendingOrder(true)
    const orderNum = serviceOrderInput.trim()

    if (activeConv.ticket?.id && !activeConv.ticket.id.startsWith('TCK-')) {
      await api
        .post(`/tickets/${activeConv.ticket.id}/notify-service-order`, {
          serviceOrderNumber: orderNum,
          customMessage: whatsappMessageInput.trim()
        })
        .catch(() => toast.error('No se pudo notificar la orden al servidor'))
    }

    setIsSendingOrder(false)
    setOpenOrderModal(false)
    toast.success(`Orden de Servicio N° ${orderNum} enviada por WhatsApp`)
  }

  return (
    <Box
      className='app-chat'
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'background.paper',
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` })
      }}
    >
      <ChatSidebarLeft
        conversations={conversations}
        selectedConvId={selectedConvId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectConv={setSelectedConvId}
        onRefresh={loadConversations}
        isRefreshing={isRefreshing}
        mdAbove={mdAbove}
        hidden={hidden}
        leftSidebarOpen={leftSidebarOpen}
        onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        sidebarWidth={sidebarWidth}
        operatorName={currentUserName}
        operatorInitials={getInitials(currentUserName)}
      />

      <ChatMainContent
        activeConv={activeConv}
        currentUserName={currentUserName}
        inputMessage={inputMessage}
        onInputChange={setInputMessage}
        onSendMessage={handleSendMessage}
        onTakeOver={handleTakeOver}
        onReleaseToBot={handleReleaseToBot}
        mdAbove={mdAbove}
        onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
      />

      <ChatDetailsSidebar
        activeConv={activeConv}
        open={rightSidebarOpen}
        hidden={hidden}
        sidebarWidth={sidebarWidth}
        onClose={() => setRightSidebarOpen(false)}
        onOpenOrderModal={handleOpenOrderModal}
      />

      <ServiceOrderDialog
        open={openOrderModal}
        onClose={() => setOpenOrderModal(false)}
        serviceOrderInput={serviceOrderInput}
        whatsappMessageInput={whatsappMessageInput}
        isSendingOrder={isSendingOrder}
        onOrderChange={val => {
          setServiceOrderInput(val)
          setWhatsappMessageInput(buildOrderMessage(val))
        }}
        onMessageChange={setWhatsappMessageInput}
        onSubmit={handleSendOrderToWhatsApp}
      />
    </Box>
  )
}

export default WhatsAppChatView
