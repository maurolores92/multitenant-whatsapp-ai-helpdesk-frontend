// ** React Imports
import { ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Subcomponents & Types
import { TenantItem } from './types'
import TenantUsersTab from './TenantUsersTab'
import TenantWhatsAppTab from './TenantWhatsAppTab'
import TenantAiTrainingTab from './TenantAiTrainingTab'
import TenantErpSyncTab from './TenantErpSyncTab'

export type CompanyModalType = 'users' | 'whatsapp' | 'ai' | 'erp'

interface ModalShellProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle: string
  icon: string
  color: 'info' | 'success' | 'primary' | 'warning'
  maxWidth?: DialogProps['maxWidth']
  children: ReactNode
}

const CompanyModalShell = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  color,
  maxWidth = 'md',
  children
}: ModalShellProps) => (
  <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
    <DialogTitle sx={{ pb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <CustomAvatar skin='light' color={color} variant='rounded' sx={{ width: 40, height: 40 }}>
            <Icon icon={icon} />
          </CustomAvatar>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <IconButton size='small' onClick={onClose}>
          <Icon icon='tabler:x' />
        </IconButton>
      </Box>
    </DialogTitle>
    <DialogContent dividers sx={{ pt: '16px !important' }}>
      {children}
    </DialogContent>
    <DialogActions sx={{ p: 4 }}>
      <Button onClick={onClose} color='secondary' variant='tonal'>
        Cerrar
      </Button>
    </DialogActions>
  </Dialog>
)

interface TenantActionModalsProps {
  activeModal: { type: CompanyModalType; tenant: TenantItem } | null
  onClose: () => void
  onRefresh: () => Promise<void>
}

const MODAL_META: Record<
  CompanyModalType,
  { title: string; icon: string; color: 'info' | 'success' | 'primary' | 'warning'; maxWidth: DialogProps['maxWidth'] }
> = {
  users: {
    title: 'Usuarios de la Compañía',
    icon: 'tabler:users',
    color: 'info',
    maxWidth: 'md'
  },
  whatsapp: {
    title: 'Configuración WhatsApp Cloud API',
    icon: 'tabler:brand-whatsapp',
    color: 'success',
    maxWidth: 'md'
  },
  ai: {
    title: 'Entrenamiento & Reglas IA',
    icon: 'tabler:robot',
    color: 'primary',
    maxWidth: 'lg'
  },
  erp: {
    title: 'Conexión HelpCopies ERP (ETL)',
    icon: 'tabler:database-import',
    color: 'warning',
    maxWidth: 'md'
  }
}

const TenantActionModals = ({ activeModal, onClose, onRefresh }: TenantActionModalsProps) => {
  if (!activeModal) return null

  const { type, tenant } = activeModal
  const meta = MODAL_META[type]

  return (
    <CompanyModalShell
      open
      onClose={onClose}
      title={`${meta.title} — ${tenant.name}`}
      subtitle={`Slug: ${tenant.slug} • ID: ${tenant.id}`}
      icon={meta.icon}
      color={meta.color}
      maxWidth={meta.maxWidth}
    >
      {type === 'users' && <TenantUsersTab tenant={tenant} onRefresh={onRefresh} />}
      {type === 'whatsapp' && <TenantWhatsAppTab tenant={tenant} onRefresh={onRefresh} />}
      {type === 'ai' && <TenantAiTrainingTab tenant={tenant} />}
      {type === 'erp' && <TenantErpSyncTab tenant={tenant} onRefresh={onRefresh} />}
    </CompanyModalShell>
  )
}

export default TenantActionModals
