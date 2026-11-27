// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Types
import {
  TicketItem,
  CatalogCustomer,
  CatalogProblemType,
  TicketPriority,
  TicketReason,
  TicketServiceType,
  TicketStatus,
  TICKET_REASON_META,
  TICKET_SOURCE_META,
  TICKET_STATUS_META
} from './types'

interface OrderModalProps {
  ticket: TicketItem | null
  serviceOrderInput: string
  whatsappMessageInput: string
  isSendingOrder: boolean
  onClose: () => void
  onOrderNumberChange: (val: string) => void
  onMessageChange: (val: string) => void
  onSend: () => void
}

export const TicketOrderModal = (props: OrderModalProps) => {
  const {
    ticket,
    serviceOrderInput,
    whatsappMessageInput,
    isSendingOrder,
    onClose,
    onOrderNumberChange,
    onMessageChange,
    onSend
  } = props

  return (
    <Dialog open={Boolean(ticket)} onClose={onClose} maxWidth='sm' fullWidth>
      {ticket && (
        <>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Icon icon='tabler:receipt' color='#1D4ED8' />
              <span>Generar Orden de Servicio #{ticket.id}</span>
            </Box>
            <IconButton size='small' onClick={onClose}>
              <Icon icon='tabler:x' />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
            <Alert severity='info'>
              Ingresa el número de orden de servicio asignado para <strong>{ticket.customerName}</strong> (
              {ticket.companyName}).
            </Alert>

            <CustomTextField
              fullWidth
              required
              autoFocus
              label='Número de Orden de Servicio (Tango ERP / Interno)'
              placeholder='Ej: OS-50824 o 0001-00045231'
              value={serviceOrderInput}
              onChange={e => onOrderNumberChange(e.target.value)}
            />

            <CustomTextField
              fullWidth
              multiline
              rows={4}
              label='Mensaje Oficial a Enviar por WhatsApp'
              value={whatsappMessageInput}
              onChange={e => onMessageChange(e.target.value)}
            />

            <Paper variant='outlined' sx={{ p: 2.5 }}>
              <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                Destinatario WhatsApp:
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 600, color: 'success.main' }}>
                {ticket.customerName} • {ticket.phone}
              </Typography>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ p: 4 }}>
            <Button onClick={onClose} color='secondary' variant='tonal'>
              Cancelar
            </Button>
            <Button
              variant='contained'
              color='success'
              onClick={onSend}
              disabled={!serviceOrderInput.trim() || isSendingOrder}
              startIcon={<Icon icon='tabler:brand-whatsapp' />}
            >
              {isSendingOrder ? 'Enviando...' : 'Enviar a WhatsApp'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

interface DetailModalProps {
  ticket: TicketItem | null
  onClose: () => void
  onQuickEdit: (
    ticket: TicketItem,
    field: 'serviceType' | 'priority' | 'status' | 'reason'
  ) => void
}

export const TicketDetailModal = ({ ticket, onClose, onQuickEdit }: DetailModalProps) => {
  return (
    <Dialog open={Boolean(ticket)} onClose={onClose} maxWidth='sm' fullWidth>
      {ticket && (
        <>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Icon icon='tabler:ticket' />
              <span>Detalle del Ticket #{ticket.id}</span>
            </Box>
            <IconButton size='small' onClick={onClose}>
              <Icon icon='tabler:x' />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
            <Box
              sx={{
                p: 3,
                borderRadius: 1,
                bgcolor: 'action.hover',
                borderLeft: theme =>
                  `4px solid ${
                    ticket.serviceType === 'ONSITE_PHYSICAL' ? theme.palette.warning.main : theme.palette.success.main
                  }`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                  {ticket.title}
                </Typography>
                <CustomChip
                  rounded
                  skin='light'
                  size='small'
                  color={TICKET_SOURCE_META[ticket.source].color}
                  icon={<Icon icon={TICKET_SOURCE_META[ticket.source].icon} fontSize='0.9rem' />}
                  label={TICKET_SOURCE_META[ticket.source].label}
                />
              </Box>
              <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                {ticket.aiDiagnostic}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, flexWrap: 'wrap' }}>
                <CustomChip
                  rounded
                  skin='light'
                  size='small'
                  color={TICKET_REASON_META[ticket.reason].color}
                  label={TICKET_REASON_META[ticket.reason].label}
                  onClick={() => onQuickEdit(ticket, 'reason')}
                  sx={{ cursor: 'pointer' }}
                />
                <CustomChip
                  rounded
                  skin='light'
                  size='small'
                  color={ticket.serviceType === 'ONSITE_PHYSICAL' ? 'error' : 'info'}
                  label={ticket.serviceType === 'ONSITE_PHYSICAL' ? 'Visita Presencial' : 'Remoto WhatsApp'}
                  onClick={() => onQuickEdit(ticket, 'serviceType')}
                  sx={{ cursor: 'pointer' }}
                />
                <CustomChip
                  rounded
                  skin='light'
                  size='small'
                  label={`Prioridad: ${ticket.priority}`}
                  onClick={() => onQuickEdit(ticket, 'priority')}
                  sx={{ cursor: 'pointer' }}
                />
                <CustomChip
                  rounded
                  skin='light'
                  size='small'
                  color={TICKET_STATUS_META[ticket.status].color}
                  label={TICKET_STATUS_META[ticket.status].label}
                  onClick={() => onQuickEdit(ticket, 'status')}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
            </Box>

            <Paper variant='outlined' sx={{ p: 3 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1.5 }}>
                Datos del Cliente
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    Contacto
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {ticket.customerName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    Razón Social {ticket.customerCode ? `(${ticket.customerCode})` : ''}
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {ticket.companyName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    WhatsApp
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'success.main', fontWeight: 600 }}>
                    {ticket.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    Dirección
                  </Typography>
                  <Typography variant='body2'>{ticket.address}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper variant='outlined' sx={{ p: 3 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1.5 }}>
                Equipo & Clasificación ERP
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    Equipo
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {ticket.equipmentName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    Número de Serie
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {ticket.equipmentSn}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    Problema ERP Asociado
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {ticket.problemTypeName || TICKET_REASON_META[ticket.reason]?.label || 'General'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    Orden ERP / Fecha Visita
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {ticket.serviceOrderNumber || 'Sin orden'}
                    {ticket.scheduledDate
                      ? ` • ${new Date(ticket.scheduledDate).toLocaleDateString('es-AR')}`
                      : ''}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {ticket.resolutionNotes && <Alert severity='success'>{ticket.resolutionNotes}</Alert>}
          </DialogContent>
          <DialogActions sx={{ p: 4, justifyContent: 'space-between' }}>
            <Button component={Link} href='/chat' variant='outlined' color='success' startIcon={<Icon icon='tabler:brand-whatsapp' />}>
              Ir a WhatsApp Chat
            </Button>
            <Button onClick={onClose} color='secondary' variant='tonal'>
              Cerrar
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

interface EditModalProps {
  ticket: TicketItem | null
  customers: CatalogCustomer[]
  problemTypes: CatalogProblemType[]
  editForm: {
    customerId: string
    equipmentId: string
    status: TicketStatus
    priority: TicketPriority
    serviceType: TicketServiceType
    reason: TicketReason
    problemTypeId: string
    serviceOrderNumber: string
    scheduledDate: string
    resolutionNotes: string
  }
  onChangeForm: (form: any) => void
  onClose: () => void
  onSave: () => void
}

export const TicketEditModal = ({
  ticket,
  customers,
  problemTypes,
  editForm,
  onChangeForm,
  onClose,
  onSave
}: EditModalProps) => {
  const selectedCustomer = customers.find(c => c.id === editForm.customerId)
  const availableEquipments = selectedCustomer?.equipments || []

  return (
    <Dialog open={Boolean(ticket)} onClose={onClose} maxWidth='sm' fullWidth>
      {ticket && (
        <>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Editar Ticket IA #{ticket.id}</span>
            <IconButton size='small' onClick={onClose}>
              <Icon icon='tabler:x' />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  fullWidth
                  label='Cliente'
                  value={editForm.customerId}
                  onChange={e => {
                    const nextCustomer = customers.find(c => c.id === e.target.value)
                    onChangeForm({
                      ...editForm,
                      customerId: e.target.value,
                      equipmentId: nextCustomer?.equipments?.[0]?.id || ''
                    })
                  }}
                >
                  {customers.length === 0 ? (
                    <MenuItem value={editForm.customerId || ''}>
                      {ticket.companyName} ({ticket.customerName})
                    </MenuItem>
                  ) : (
                    customers.map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.companyName || c.name}
                        {c.externalCode ? ` [${c.externalCode}]` : ''}
                      </MenuItem>
                    ))
                  )}
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  fullWidth
                  label='Equipo Asociado'
                  value={editForm.equipmentId}
                  onChange={e => onChangeForm({ ...editForm, equipmentId: e.target.value })}
                >
                  <MenuItem value=''>Sin equipo específico</MenuItem>
                  {availableEquipments.map(eq => (
                    <MenuItem key={eq.id} value={eq.id}>
                      {eq.name}
                      {eq.serialNumber ? ` (S/N: ${eq.serialNumber})` : ''}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  fullWidth
                  label='Estado de la Orden'
                  value={editForm.status}
                  onChange={e => onChangeForm({ ...editForm, status: e.target.value })}
                >
                  {(Object.keys(TICKET_STATUS_META) as TicketStatus[]).map(s => (
                    <MenuItem key={s} value={s}>
                      {TICKET_STATUS_META[s].label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  fullWidth
                  label='Categoría de Motivo'
                  value={editForm.reason}
                  onChange={e => onChangeForm({ ...editForm, reason: e.target.value })}
                >
                  {(Object.keys(TICKET_REASON_META) as TicketReason[]).map(r => (
                    <MenuItem key={r} value={r}>
                      {TICKET_REASON_META[r].label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              {problemTypes.length > 0 && (
                <Grid item xs={12}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Problema Sincronizado (HelpCopies ERP)'
                    value={editForm.problemTypeId}
                    onChange={e => {
                      const picked = problemTypes.find(p => p.id === e.target.value)
                      onChangeForm({
                        ...editForm,
                        problemTypeId: e.target.value,
                        ...(picked
                          ? { reason: picked.defaultReason, serviceType: picked.defaultServiceType }
                          : {})
                      })
                    }}
                  >
                    <MenuItem value=''>Sin problema específico del ERP</MenuItem>
                    {problemTypes.map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.externalCode ? `[${p.externalCode}] ` : ''}
                        {p.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  fullWidth
                  label='Modalidad'
                  value={editForm.serviceType}
                  onChange={e => onChangeForm({ ...editForm, serviceType: e.target.value })}
                >
                  <MenuItem value='ONSITE_PHYSICAL'>Visita Presencial en Local</MenuItem>
                  <MenuItem value='REMOTE_WHATSAPP'>Soporte Remoto WhatsApp</MenuItem>
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  fullWidth
                  label='Prioridad'
                  value={editForm.priority}
                  onChange={e => onChangeForm({ ...editForm, priority: e.target.value })}
                >
                  <MenuItem value='CRITICAL'>Crítica</MenuItem>
                  <MenuItem value='HIGH'>Alta</MenuItem>
                  <MenuItem value='MEDIUM'>Media</MenuItem>
                  <MenuItem value='LOW'>Baja</MenuItem>
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='N° Orden ERP'
                  value={editForm.serviceOrderNumber}
                  onChange={e => onChangeForm({ ...editForm, serviceOrderNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  type='date'
                  label='Fecha Visita'
                  value={editForm.scheduledDate}
                  onChange={e => onChangeForm({ ...editForm, scheduledDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <CustomTextField
              fullWidth
              multiline
              rows={3}
              label='Notas de Resolución / Seguimiento'
              value={editForm.resolutionNotes}
              onChange={e => onChangeForm({ ...editForm, resolutionNotes: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 4 }}>
            <Button onClick={onClose} color='secondary' variant='tonal'>
              Cancelar
            </Button>
            <Button onClick={onSave} variant='contained'>
              Guardar Cambios
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

interface QuickEditModalProps {
  quickEdit: {
    ticket: TicketItem
    field: 'serviceType' | 'priority' | 'status' | 'reason'
    selectedValue: string
  } | null
  isSaving: boolean
  onClose: () => void
  onChangeValue: (val: string) => void
  onSave: () => void
}

export const TicketQuickEditModal = ({
  quickEdit,
  isSaving,
  onClose,
  onChangeValue,
  onSave
}: QuickEditModalProps) => (
  <Dialog open={Boolean(quickEdit)} onClose={onClose} maxWidth='xs' fullWidth>
    {quickEdit && (
      <>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {quickEdit.field === 'serviceType'
              ? 'Cambiar Modalidad'
              : quickEdit.field === 'priority'
              ? 'Cambiar Prioridad'
              : quickEdit.field === 'reason'
              ? 'Cambiar Motivo'
              : 'Cambiar Estado'}
          </span>
          <IconButton size='small' onClick={onClose}>
            <Icon icon='tabler:x' />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
          <CustomTextField
            select
            fullWidth
            label='Seleccionar valor'
            value={quickEdit.selectedValue}
            onChange={e => onChangeValue(e.target.value)}
          >
            {quickEdit.field === 'serviceType' && [
              <MenuItem key='ONSITE_PHYSICAL' value='ONSITE_PHYSICAL'>
                Visita Técnica Presencial en Local
              </MenuItem>,
              <MenuItem key='REMOTE_WHATSAPP' value='REMOTE_WHATSAPP'>
                Atención Remota por WhatsApp
              </MenuItem>
            ]}
            {quickEdit.field === 'priority' && [
              <MenuItem key='CRITICAL' value='CRITICAL'>
                Crítica
              </MenuItem>,
              <MenuItem key='HIGH' value='HIGH'>
                Alta
              </MenuItem>,
              <MenuItem key='MEDIUM' value='MEDIUM'>
                Media
              </MenuItem>,
              <MenuItem key='LOW' value='LOW'>
                Baja
              </MenuItem>
            ]}
            {quickEdit.field === 'status' &&
              (Object.keys(TICKET_STATUS_META) as TicketStatus[]).map(s => (
                <MenuItem key={s} value={s}>
                  {TICKET_STATUS_META[s].label}
                </MenuItem>
              ))}
            {quickEdit.field === 'reason' &&
              (Object.keys(TICKET_REASON_META) as TicketReason[]).map(r => (
                <MenuItem key={r} value={r}>
                  {TICKET_REASON_META[r].label}
                </MenuItem>
              ))}
          </CustomTextField>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button onClick={onClose} color='secondary' variant='tonal'>
            Cancelar
          </Button>
          <Button onClick={onSave} variant='contained' disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Cambio'}
          </Button>
        </DialogActions>
      </>
    )}
  </Dialog>
)
