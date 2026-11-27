// ** React Imports
import { useState, useCallback, useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components
import CustomChip from 'src/@core/components/mui/chip'
import Autocomplete from 'src/layouts/components/Autocomplete'
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import NotificationDropdown, {
  NotificationsType
} from 'src/@core/layouts/components/shared-components/NotificationDropdown'
import ShortcutsDropdown, { ShortcutsType } from 'src/@core/layouts/components/shared-components/ShortcutsDropdown'

// ** Hook Import
import { useAuth } from 'src/hooks/useAuth'
import { useSocket } from 'src/hooks/useSocket'

interface Props {
  hidden: boolean
  settings: Settings
  saveSettings: (values: Settings) => void
}

const AppBarContent = (props: Props) => {
  // ** Props
  const { hidden, settings, saveSettings } = props

  // ** Hook
  const auth = useAuth()
  const [notifications, setNotifications] = useState<NotificationsType[]>([
    {
      meta: 'Ahora',
      avatarColor: 'success',
      avatarIcon: <Icon icon='tabler:plug-connected' />,
      title: 'Sistema Conectado',
      subtitle: 'Servicios en tiempo real activos'
    }
  ])

  const handleNotification = useCallback((notif: any) => {
    if (!notif) return
    const title = notif.title || 'Nueva Notificación'
    const subtitle = notif.body || notif.message || 'Actualización del sistema'

    setNotifications(prev => [
      {
        meta: 'Ahora',
        avatarColor: 'primary',
        avatarIcon: <Icon icon='tabler:brand-whatsapp' />,
        title,
        subtitle
      },
      ...prev.slice(0, 19)
    ])

    toast.success(`${title}: ${subtitle}`)
  }, [])

  const { isConnected } = useSocket({
    onNotification: handleNotification
  })

  const shortcuts: ShortcutsType[] = useMemo(() => {
    if (auth.user?.role === 'SUPER_ADMIN') {
      return [
        { title: 'Compañías', url: '/companies', icon: 'tabler:building', subtitle: 'Gestión Multi-Tenant' },
        { title: 'Usuarios', url: '/users', icon: 'tabler:users', subtitle: 'Equipo y Roles' }
      ]
    }

    return [
      { title: 'Dashboard', url: '/dashboard', icon: 'tabler:smart-home', subtitle: 'Resumen y KPIs' },
      { title: 'WhatsApp Chat', url: '/chat', icon: 'tabler:brand-whatsapp', subtitle: 'Consola en Vivo' },
      { title: 'Tickets & IA', url: '/tickets', icon: 'tabler:ticket', subtitle: 'Órdenes de Servicio' }
    ]
  }, [auth.user?.role])

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {auth.user && <Autocomplete hidden={hidden} settings={settings} />}
      {auth.user && (
        <CustomChip
          rounded
          skin='light'
          size='small'
          color={isConnected ? 'success' : 'secondary'}
          icon={<Icon icon={isConnected ? 'tabler:wifi' : 'tabler:wifi-off'} fontSize='0.95rem' />}
          label={
            <Typography variant='caption' sx={{ fontWeight: 600, color: 'inherit' }}>
              {isConnected ? 'Socket Online' : 'Offline'}
            </Typography>
          }
        />
      )}
      <ModeToggler settings={settings} saveSettings={saveSettings} />
      {auth.user && (
        <>
          <ShortcutsDropdown settings={settings} shortcuts={shortcuts} />
          <NotificationDropdown settings={settings} notifications={notifications} />
          <UserDropdown settings={settings} />
        </>
      )}
    </Box>
  )
}

export default AppBarContent
