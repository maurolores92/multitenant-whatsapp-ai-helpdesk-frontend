// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Tabs from '@mui/material/Tabs'
import Table from '@mui/material/Table'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import TableRow from '@mui/material/TableRow'
import MenuItem from '@mui/material/MenuItem'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import InputAdornment from '@mui/material/InputAdornment'
import TableContainer from '@mui/material/TableContainer'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'

// ** API & Subcomponents
import api from 'src/configs/api'
import {
  TicketItem,
  CatalogCustomer,
  CatalogProblemType,
  TicketPriority,
  TicketReason,
  TicketServiceType,
  TicketSource,
  TicketStatus,
  TICKET_REASON_META,
  TICKET_SOURCE_META,
  TICKET_STATUS_META
} from './types'
import {
  TicketOrderModal,
  TicketDetailModal,
  TicketEditModal,
  TicketQuickEditModal
} from './TicketModals'

const TicketsView = () => {
  const [currentTab, setCurrentTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [reasonFilter, setReasonFilter] = useState<'ALL' | TicketReason>('ALL')
  const [sourceFilter, setSourceFilter] = useState<'ALL' | TicketSource>('ALL')

  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [customers, setCustomers] = useState<CatalogCustomer[]>([])
  const [problemTypes, setProblemTypes] = useState<CatalogProblemType[]>([])

  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null)
  const [editingTicket, setEditingTicket] = useState<TicketItem | null>(null)

  const [orderModalTicket, setOrderModalTicket] = useState<TicketItem | null>(null)
  const [serviceOrderInput, setServiceOrderInput] = useState('')
  const [whatsappMessageInput, setWhatsappMessageInput] = useState('')
  const [isSendingOrder, setIsSendingOrder] = useState(false)

  const [quickEditModal, setQuickEditModal] = useState<{
    ticket: TicketItem
    field: 'serviceType' | 'priority' | 'status' | 'reason'
    selectedValue: string
  } | null>(null)
  const [isSavingQuickEdit, setIsSavingQuickEdit] = useState(false)

  const [editForm, setEditForm] = useState({
    customerId: '',
    equipmentId: '',
    status: 'OPEN' as TicketStatus,
    priority: 'HIGH' as TicketPriority,
    serviceType: 'ONSITE_PHYSICAL' as TicketServiceType,
    reason: 'OTHER' as TicketReason,
    problemTypeId: '',
    serviceOrderNumber: '',
    scheduledDate: '',
    resolutionNotes: ''
  })

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [ticketsRes, catalogsRes] = await Promise.all([
        api.get('/tickets'),
        api.get('/tickets/catalogs').catch(() => ({ data: { customers: [], problemTypes: [] } }))
      ])

      const data = Array.isArray(ticketsRes.data) ? ticketsRes.data : []
      setTickets(
        data.map((t: any) => ({
          id: t.id ? (t.id.startsWith('TCK') ? t.id : `TCK-${t.id.slice(-4).toUpperCase()}`) : 'TCK-0000',
          rawId: t.id,
          title: t.title || 'Incidencia de Servicio',
          description: t.description || '',
          customerId: t.customerId,
          customerName: t.customer?.name || 'Cliente WhatsApp',
          companyName: t.customer?.companyName || t.customer?.name || 'Empresa Cliente',
          customerCode: t.customer?.externalCode || '',
          phone: t.customer?.phone || '',
          address: t.customer?.address || 'Sin dirección',
          equipmentId: t.equipmentId || '',
          equipmentName: t.equipment?.name || 'Equipo General',
          equipmentModel: `${t.equipment?.brand || ''} ${t.equipment?.model || ''}`.trim() || 'Modelo estándar',
          equipmentSn: t.equipment?.serialNumber || 'S/N',
          serviceType: t.serviceType || 'REMOTE_WHATSAPP',
          priority: t.priority || 'MEDIUM',
          status: t.status || 'OPEN',
          source: t.source || 'AI_WHATSAPP',
          reason: t.reason || 'OTHER',
          problemTypeId: t.problemTypeId || t.problemType?.id || '',
          problemTypeName: t.problemType?.name || '',
          serviceOrderNumber: t.serviceOrderNumber || '',
          scheduledDate: t.scheduledDate || '',
          aiDiagnostic: t.aiDiagnostic || t.description || 'Sin diagnóstico registrado.',
          time: new Date(t.createdAt).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          resolutionNotes: t.resolutionNotes || ''
        }))
      )

      setCustomers(Array.isArray(catalogsRes.data?.customers) ? catalogsRes.data.customers : [])
      setProblemTypes(Array.isArray(catalogsRes.data?.problemTypes) ? catalogsRes.data.problemTypes : [])
    } catch {
      toast.error('No se pudieron cargar los tickets del servidor')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalCount = tickets.length
  const onsiteCount = tickets.filter(t => t.serviceType === 'ONSITE_PHYSICAL').length
  const workshopPartsCount = tickets.filter(t => t.status === 'WORKSHOP' || t.status === 'WAITING_PARTS').length
  const remoteCount = tickets.filter(t => t.serviceType === 'REMOTE_WHATSAPP').length
  const pendingCount = tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CANCELLED').length

  const filteredTickets = tickets.filter(t => {
    if (currentTab === 1 && (t.status === 'RESOLVED' || t.status === 'CANCELLED')) return false
    if (currentTab === 2 && t.serviceType !== 'ONSITE_PHYSICAL') return false
    if (currentTab === 3 && t.status !== 'WORKSHOP' && t.status !== 'WAITING_PARTS') return false
    if (currentTab === 4 && t.serviceType !== 'REMOTE_WHATSAPP') return false
    if (currentTab === 5 && t.status !== 'RESOLVED') return false

    if (reasonFilter !== 'ALL' && t.reason !== reasonFilter) return false
    if (sourceFilter !== 'ALL' && t.source !== sourceFilter) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()

      return (
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.companyName.toLowerCase().includes(q) ||
        (t.customerCode || '').toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q) ||
        t.equipmentName.toLowerCase().includes(q) ||
        t.equipmentSn.toLowerCase().includes(q) ||
        (t.serviceOrderNumber || '').toLowerCase().includes(q) ||
        (t.problemTypeName || '').toLowerCase().includes(q) ||
        t.aiDiagnostic.toLowerCase().includes(q)
      )
    }

    return true
  })

  const buildOrderMsg = (ticket: TicketItem, orderNum: string) =>
    `Estimado/a ${ticket.customerName}, le informamos que se ha generado la *Orden de Servicio N° ${
      orderNum.trim() || '######'
    }* para la atención técnica de su equipo *${ticket.equipmentName}* (S/N: ${ticket.equipmentSn}).`

  const handleOpenOrderModal = (ticket: TicketItem) => {
    setOrderModalTicket(ticket)
    const initial = ticket.serviceOrderNumber || ''
    setServiceOrderInput(initial)
    setWhatsappMessageInput(buildOrderMsg(ticket, initial))
  }

  const handleSendOrderToWhatsApp = async () => {
    if (!orderModalTicket || !serviceOrderInput.trim()) return
    setIsSendingOrder(true)
    const orderNum = serviceOrderInput.trim()

    try {
      if (orderModalTicket.rawId) {
        await api.post(`/tickets/${orderModalTicket.rawId}/notify-service-order`, {
          serviceOrderNumber: orderNum,
          customMessage: whatsappMessageInput.trim()
        })
      }
      toast.success(`Orden de Servicio N° ${orderNum} enviada por WhatsApp`)
      setOrderModalTicket(null)
      fetchData()
    } catch {
      toast.error('No se pudo notificar la orden al servidor')
    } finally {
      setIsSendingOrder(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingTicket) return
    try {
      if (editingTicket.rawId) {
        await api.patch(`/tickets/${editingTicket.rawId}`, {
          ...(editForm.customerId ? { customerId: editForm.customerId } : {}),
          equipmentId: editForm.equipmentId || null,
          problemTypeId: editForm.problemTypeId || null,
          status: editForm.status,
          priority: editForm.priority,
          serviceType: editForm.serviceType,
          reason: editForm.reason,
          serviceOrderNumber: editForm.serviceOrderNumber,
          scheduledDate: editForm.scheduledDate ? new Date(editForm.scheduledDate).toISOString() : null,
          resolutionNotes: editForm.resolutionNotes
        })
      }
      toast.success(`Ticket #${editingTicket.id} actualizado`)
      setEditingTicket(null)
      fetchData()
    } catch {
      toast.error('Error al actualizar el ticket en el servidor')
    }
  }

  const handleSaveQuickEdit = async () => {
    if (!quickEditModal) return
    setIsSavingQuickEdit(true)
    const { ticket, field, selectedValue } = quickEditModal

    try {
      if (ticket.rawId) {
        await api.patch(`/tickets/${ticket.rawId}`, {
          [field]: selectedValue
        })
      }
      toast.success(`Ticket #${ticket.id} actualizado`)
      setQuickEditModal(null)
      setSelectedTicket(null)
      fetchData()
    } catch {
      toast.error('Error al actualizar el ticket')
    } finally {
      setIsSavingQuickEdit(false)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(totalCount)}
          trend='positive'
          trendDiff='Total'
          title='Tickets & Órdenes'
          subtitle={`${pendingCount} abiertos / en curso`}
          avatarColor='primary'
          icon='tabler:ticket'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(onsiteCount)}
          trend='negative'
          trendDiff='Calle'
          title='Visitas Presenciales'
          subtitle='Técnico en domicilio cliente'
          avatarColor='warning'
          icon='tabler:map-pin'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(workshopPartsCount)}
          trend='negative'
          trendDiff='Taller'
          title='Taller / Repuestos'
          subtitle='Esperando repuesto o banco'
          avatarColor='error'
          icon='tabler:tools'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(remoteCount)}
          trend='positive'
          trendDiff='WhatsApp'
          title='Soporte Remoto'
          subtitle='Resolución por WhatsApp'
          avatarColor='success'
          icon='tabler:brand-whatsapp'
        />
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Tickets IA & Órdenes de Servicio'
            subheader='Seguimiento y edición de tickets generados automáticamente por la IA desde WhatsApp'
            action={
              <CustomChip
                rounded
                skin='light'
                color='info'
                icon={<Icon icon='tabler:robot' fontSize='1rem' />}
                label='Creación Exclusiva por IA WhatsApp'
              />
            }
          />

          <Box sx={{ px: 5, pb: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)} variant='scrollable' scrollButtons='auto'>
              <Tab label={`Todos (${totalCount})`} />
              <Tab label={`Pendientes (${pendingCount})`} />
              <Tab label={`Visita Presencial (${onsiteCount})`} />
              <Tab label={`Taller / Repuestos (${workshopPartsCount})`} />
              <Tab label={`Remoto WhatsApp (${remoteCount})`} />
              <Tab label='Resueltos' />
            </Tabs>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='Buscar por ticket, orden ERP, cliente, COD_CLIENT, equipo, S/N...'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Icon icon='tabler:search' fontSize='1.125rem' />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <CustomTextField
                  select
                  fullWidth
                  value={reasonFilter}
                  onChange={e => setReasonFilter(e.target.value as any)}
                >
                  <MenuItem value='ALL'>Todos los Motivos</MenuItem>
                  {(Object.keys(TICKET_REASON_META) as TicketReason[]).map(r => (
                    <MenuItem key={r} value={r}>
                      {TICKET_REASON_META[r].label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <CustomTextField
                  select
                  fullWidth
                  value={sourceFilter}
                  onChange={e => setSourceFilter(e.target.value as any)}
                >
                  <MenuItem value='ALL'>Todos los Orígenes</MenuItem>
                  {(Object.keys(TICKET_SOURCE_META) as TicketSource[]).map(src => (
                    <MenuItem key={src} value={src}>
                      {TICKET_SOURCE_META[src].label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
            </Grid>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 1120 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket / Origen</TableCell>
                  <TableCell>Cliente / Razón Social</TableCell>
                  <TableCell>Equipo</TableCell>
                  <TableCell>Motivo / Problema</TableCell>
                  <TableCell>Modalidad</TableCell>
                  <TableCell>Prioridad</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Orden ERP</TableCell>
                  <TableCell align='right'>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} align='center' sx={{ py: 8 }}>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        Cargando órdenes de servicio...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align='center' sx={{ py: 8 }}>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        No se encontraron tickets generados por la IA con los filtros aplicados.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map(ticket => {
                    const isOnsite = ticket.serviceType === 'ONSITE_PHYSICAL'
                    const priorityColor =
                      ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH'
                        ? 'error'
                        : ticket.priority === 'MEDIUM'
                        ? 'warning'
                        : 'secondary'
                    const statusMeta = TICKET_STATUS_META[ticket.status] || TICKET_STATUS_META.OPEN
                    const reasonMeta = TICKET_REASON_META[ticket.reason] || TICKET_REASON_META.OTHER
                    const sourceMeta = TICKET_SOURCE_META[ticket.source] || TICKET_SOURCE_META.AI_WHATSAPP

                    return (
                      <TableRow
                        key={ticket.id}
                        hover
                        onClick={() => setSelectedTicket(ticket)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography variant='body2' sx={{ fontWeight: 700, color: 'primary.main' }}>
                            #{ticket.id}
                          </Typography>
                          <CustomChip
                            rounded
                            skin='light'
                            size='small'
                            color={sourceMeta.color}
                            icon={<Icon icon={sourceMeta.icon} fontSize='0.8rem' />}
                            label={sourceMeta.label}
                            sx={{ height: 20, fontSize: '0.68rem', my: 0.5 }}
                          />
                          <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }}>
                            {ticket.time}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {ticket.companyName}
                          </Typography>
                          <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                            {ticket.customerName} {ticket.customerCode ? `• [${ticket.customerCode}]` : ''}
                          </Typography>
                          <Typography variant='caption' sx={{ color: 'success.main' }}>
                            {ticket.phone}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {ticket.equipmentName}
                          </Typography>
                          <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                            S/N: {ticket.equipmentSn}
                          </Typography>
                        </TableCell>

                        <TableCell onClick={e => e.stopPropagation()}>
                          <CustomChip
                            rounded
                            skin='light'
                            size='small'
                            color={reasonMeta.color}
                            label={reasonMeta.label}
                            onClick={() =>
                              setQuickEditModal({ ticket, field: 'reason', selectedValue: ticket.reason })
                            }
                            sx={{ cursor: 'pointer' }}
                          />
                          {ticket.problemTypeName && (
                            <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                              {ticket.problemTypeName}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell onClick={e => e.stopPropagation()}>
                          <CustomChip
                            rounded
                            skin='light'
                            size='small'
                            color={isOnsite ? 'error' : 'info'}
                            label={isOnsite ? 'Visita Presencial' : 'Remoto WhatsApp'}
                            onClick={() =>
                              setQuickEditModal({ ticket, field: 'serviceType', selectedValue: ticket.serviceType })
                            }
                            sx={{ cursor: 'pointer' }}
                          />
                        </TableCell>

                        <TableCell onClick={e => e.stopPropagation()}>
                          <CustomChip
                            rounded
                            skin='light'
                            size='small'
                            color={priorityColor as any}
                            label={ticket.priority}
                            onClick={() =>
                              setQuickEditModal({ ticket, field: 'priority', selectedValue: ticket.priority })
                            }
                            sx={{ cursor: 'pointer' }}
                          />
                        </TableCell>

                        <TableCell onClick={e => e.stopPropagation()}>
                          <CustomChip
                            rounded
                            skin='light'
                            size='small'
                            color={statusMeta.color}
                            label={statusMeta.label}
                            onClick={() => setQuickEditModal({ ticket, field: 'status', selectedValue: ticket.status })}
                            sx={{ cursor: 'pointer' }}
                          />
                        </TableCell>

                        <TableCell>
                          {ticket.serviceOrderNumber ? (
                            <CustomChip
                              rounded
                              skin='light'
                              size='small'
                              color='secondary'
                              label={ticket.serviceOrderNumber}
                            />
                          ) : (
                            <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                              Sin N° Orden
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell align='right' onClick={e => e.stopPropagation()}>
                          <Stack direction='row' spacing={0.5} justifyContent='flex-end'>
                            <Tooltip title='Ir a WhatsApp Chat'>
                              <IconButton component={Link} href='/chat' size='small' color='success'>
                                <Icon icon='tabler:brand-whatsapp' fontSize='1.125rem' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Notificar Orden de Servicio'>
                              <IconButton size='small' color='secondary' onClick={() => handleOpenOrderModal(ticket)}>
                                <Icon icon='tabler:receipt' fontSize='1.125rem' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Ver Detalle'>
                              <IconButton size='small' color='info' onClick={() => setSelectedTicket(ticket)}>
                                <Icon icon='tabler:eye' fontSize='1.125rem' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Editar Completo'>
                              <IconButton
                                size='small'
                                onClick={() => {
                                  setEditingTicket(ticket)
                                  setEditForm({
                                    customerId: ticket.customerId || '',
                                    equipmentId: ticket.equipmentId || '',
                                    status: ticket.status,
                                    priority: ticket.priority,
                                    serviceType: ticket.serviceType,
                                    reason: ticket.reason,
                                    problemTypeId: ticket.problemTypeId || '',
                                    serviceOrderNumber: ticket.serviceOrderNumber || '',
                                    scheduledDate: ticket.scheduledDate ? ticket.scheduledDate.slice(0, 10) : '',
                                    resolutionNotes: ticket.resolutionNotes || ''
                                  })
                                }}
                              >
                                <Icon icon='tabler:edit' fontSize='1.125rem' />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>

      <TicketOrderModal
        ticket={orderModalTicket}
        serviceOrderInput={serviceOrderInput}
        whatsappMessageInput={whatsappMessageInput}
        isSendingOrder={isSendingOrder}
        onClose={() => setOrderModalTicket(null)}
        onOrderNumberChange={val => {
          setServiceOrderInput(val)
          if (orderModalTicket) setWhatsappMessageInput(buildOrderMsg(orderModalTicket, val))
        }}
        onMessageChange={setWhatsappMessageInput}
        onSend={handleSendOrderToWhatsApp}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onQuickEdit={(ticket, field) =>
          setQuickEditModal({
            ticket,
            field,
            selectedValue: ticket[field] as string
          })
        }
      />

      <TicketEditModal
        ticket={editingTicket}
        customers={customers}
        problemTypes={problemTypes}
        editForm={editForm}
        onChangeForm={setEditForm}
        onClose={() => setEditingTicket(null)}
        onSave={handleSaveEdit}
      />

      <TicketQuickEditModal
        quickEdit={quickEditModal}
        isSaving={isSavingQuickEdit}
        onClose={() => setQuickEditModal(null)}
        onChangeValue={val => setQuickEditModal(prev => (prev ? { ...prev, selectedValue: val } : null))}
        onSave={handleSaveQuickEdit}
      />
    </Grid>
  )
}

export default TicketsView
