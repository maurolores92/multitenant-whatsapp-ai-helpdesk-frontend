// ** MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

// ** Config & Utils
import {
  PERMISSIONS,
  TECHNICAL_CHAT_PERMISSIONS,
  TECHNICAL_SERVICE_BUNDLE,
  TECHNICAL_TICKET_PERMISSIONS
} from 'src/configs/permissions'

interface Props {
  permissions: string[]
  onChange: (nextPermissions: string[]) => void
  disabled?: boolean
}

const ADMIN_ITEMS = [
  { code: PERMISSIONS.MANAGE_USERS_ROLES, label: 'Administrar Usuarios y Permisos' },
  { code: PERMISSIONS.MANAGE_WHATSAPP_CONFIG, label: 'Configurar WhatsApp y ERP' },
  { code: PERMISSIONS.VIEW_AUDIT_LOGS, label: 'Ver Auditoría' }
]

const toggleGroup = (current: string[], codes: string[], enable: boolean): string[] => {
  const set = new Set(current)
  if (enable) {
    codes.forEach(c => set.add(c))
  } else {
    codes.forEach(c => set.delete(c))
  }

  return Array.from(set)
}

const toggleSingle = (current: string[], code: string): string[] => {
  if (current.includes(code)) {
    return current.filter(item => item !== code)
  }

  return [...current, code]
}

const UserPermissionsSelector = ({ permissions, onChange, disabled = false }: Props) => {
  const hasAnyTechService =
    permissions.includes(PERMISSIONS.ACCESS_TECHNICAL_SERVICE) ||
    TECHNICAL_CHAT_PERMISSIONS.some(c => permissions.includes(c)) ||
    TECHNICAL_TICKET_PERMISSIONS.some(c => permissions.includes(c)) ||
    permissions.includes(PERMISSIONS.MANAGE_TECHNICAL_AI)

  const hasTechChats = TECHNICAL_CHAT_PERMISSIONS.every(c => permissions.includes(c)) || permissions.includes(PERMISSIONS.READ_CHATS)
  const hasTechTickets =
    permissions.includes(PERMISSIONS.CREATE_TICKET) || permissions.includes(PERMISSIONS.UPDATE_TICKET)
  const hasTechAi = permissions.includes(PERMISSIONS.MANAGE_TECHNICAL_AI)

  const handleToggleTechnicalModule = (checked: boolean) => {
    onChange(toggleGroup(permissions, TECHNICAL_SERVICE_BUNDLE, checked))
  }

  const handleToggleSubChats = (checked: boolean) => {
    let next = toggleGroup(permissions, TECHNICAL_CHAT_PERMISSIONS, checked)
    if (checked) {
      next = Array.from(new Set([...next, PERMISSIONS.ACCESS_TECHNICAL_SERVICE]))
    }
    onChange(next)
  }

  const handleToggleSubTickets = (checked: boolean) => {
    let next = toggleGroup(permissions, TECHNICAL_TICKET_PERMISSIONS, checked)
    if (checked) {
      next = Array.from(new Set([...next, PERMISSIONS.ACCESS_TECHNICAL_SERVICE]))
    }
    onChange(next)
  }

  const handleToggleSubAi = (checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...permissions, PERMISSIONS.MANAGE_TECHNICAL_AI, PERMISSIONS.ACCESS_TECHNICAL_SERVICE]))
      : permissions.filter(p => p !== PERMISSIONS.MANAGE_TECHNICAL_AI)
    onChange(next)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
        Permisos por Módulo (Personalizado por Usuario)
      </Typography>

      {/* Módulo Servicio Técnico */}
      <Paper variant='outlined' sx={{ p: 3, borderRadius: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
              Servicio Técnico
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              Chats de IA, Tickets/Equipos y Agente IA de Servicio Técnico
            </Typography>
          </Box>
          <Switch
            color='warning'
            disabled={disabled}
            checked={hasAnyTechService}
            onChange={e => handleToggleTechnicalModule(e.target.checked)}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', pl: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                size='small'
                disabled={disabled}
                checked={hasTechChats}
                onChange={e => handleToggleSubChats(e.target.checked)}
              />
            }
            label={<Typography variant='body2'>Chats de IA (/chat)</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                size='small'
                disabled={disabled}
                checked={hasTechTickets}
                onChange={e => handleToggleSubTickets(e.target.checked)}
              />
            }
            label={<Typography variant='body2'>Tickets y Equipos (/tickets)</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                size='small'
                disabled={disabled}
                checked={hasTechAi}
                onChange={e => handleToggleSubAi(e.target.checked)}
              />
            }
            label={<Typography variant='body2'>Configurar y Entrenar IA Técnica (/technical-ai)</Typography>}
          />
        </Box>
      </Paper>

      {/* Administración */}
      <Paper variant='outlined' sx={{ p: 3, borderRadius: 1.5 }}>
        <Typography variant='body2' sx={{ fontWeight: 700, mb: 1 }}>
          Administración General
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', pl: 1 }}>
          {ADMIN_ITEMS.map(item => (
            <FormControlLabel
              key={item.code}
              control={
                <Checkbox
                  size='small'
                  disabled={disabled}
                  checked={permissions.includes(item.code)}
                  onChange={() => onChange(toggleSingle(permissions, item.code))}
                />
              }
              label={<Typography variant='body2'>{item.label}</Typography>}
            />
          ))}
        </Box>
      </Paper>

      <Alert severity='info' sx={{ py: 1 }}>
        <Typography variant='caption'>
          Próximamente podrás habilitar aquí el módulo <strong>Contadores</strong> (línea y envíos mensuales).
        </Typography>
      </Alert>
    </Box>
  )
}

export default UserPermissionsSelector
