// ** React Imports
import { useEffect, useCallback, useRef, useState, useMemo } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import MuiDialog from '@mui/material/Dialog'
import ListItem from '@mui/material/ListItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import ListItemButton from '@mui/material/ListItemButton'
import InputAdornment from '@mui/material/InputAdornment'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hook
import { useAuth } from 'src/hooks/useAuth'

// ** Types Imports
import { Settings } from 'src/@core/context/settingsContext'

interface Props {
  hidden: boolean
  settings: Settings
}

interface SearchRouteItem {
  title: string
  subtitle: string
  url: string
  icon: string
  roles?: string[]
}

const ALL_ROUTES: SearchRouteItem[] = [
  {
    title: 'Dashboard',
    subtitle: 'KPIs en vivo y tickets escalados por IA',
    url: '/dashboard',
    icon: 'tabler:smart-home',
    roles: ['ADMIN', 'TECHNICIAN', 'AGENT']
  },
  {
    title: 'WhatsApp Chat',
    subtitle: 'Consola de conversaciones en vivo y control humano / IA',
    url: '/chat',
    icon: 'tabler:brand-whatsapp',
    roles: ['ADMIN', 'TECHNICIAN', 'AGENT']
  },
  {
    title: 'Tickets & Órdenes de Servicio',
    subtitle: 'Triaje técnico, diagnóstico IA y órdenes Tango ERP',
    url: '/tickets',
    icon: 'tabler:ticket',
    roles: ['ADMIN', 'TECHNICIAN', 'AGENT']
  },
  {
    title: 'Usuarios del Equipo',
    subtitle: 'Alta, edición, roles y contraseñas de operadores',
    url: '/users',
    icon: 'tabler:users',
    roles: ['SUPER_ADMIN', 'ADMIN']
  },
  {
    title: 'Compañías (Multi-Tenant)',
    subtitle: 'Gestión de empresas, WhatsApp Cloud API y entrenamiento IA',
    url: '/companies',
    icon: 'tabler:building',
    roles: ['SUPER_ADMIN']
  }
]

const Dialog = styled(MuiDialog)({
  '& .MuiBackdrop-root': {
    backdropFilter: 'blur(4px)'
  },
  '& .MuiDialog-paper': {
    overflow: 'hidden',
    '&:not(.MuiDialog-paperFullScreen)': {
      maxHeight: 480
    }
  }
})

const AutocompleteComponent = ({ hidden, settings }: Props) => {
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  const theme = useTheme()
  const router = useRouter()
  const { user } = useAuth()
  const { layout } = settings
  const wrapper = useRef<HTMLDivElement>(null)
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down('sm'))

  const allowedRoutes = useMemo(() => {
    const role = user?.role || ''

    return ALL_ROUTES.filter(item => !item.roles || item.roles.includes(role))
  }, [user?.role])

  const filteredRoutes = useMemo(() => {
    const q = searchValue.trim().toLowerCase()
    if (!q) return allowedRoutes

    return allowedRoutes.filter(
      item => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    )
  }, [allowedRoutes, searchValue])

  useEffect(() => {
    if (!openDialog) {
      setSearchValue('')
    }
  }, [openDialog])

  useEffect(() => {
    setIsMounted(true)

    return () => setIsMounted(false)
  }, [])

  const handleOptionClick = (url: string) => {
    setSearchValue('')
    setOpenDialog(false)
    router.push(url)
  }

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (!openDialog && event.ctrlKey && event.which === 191) {
        setOpenDialog(true)
      }
    },
    [openDialog]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [handleKeydown])

  if (!isMounted) {
    return null
  }

  return (
    <Box
      ref={wrapper}
      onClick={() => !openDialog && setOpenDialog(true)}
      sx={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}
    >
      <IconButton color='inherit' sx={!hidden && layout === 'vertical' ? { mr: 0.5, ml: -2.75 } : {}}>
        <Icon fontSize='1.5rem' icon='tabler:search' />
      </IconButton>
      {!hidden && layout === 'vertical' ? (
        <Typography sx={{ userSelect: 'none', color: 'text.disabled' }}>Buscar módulo (Ctrl+/)</Typography>
      ) : null}
      {openDialog && (
        <Dialog fullWidth open={openDialog} fullScreen={fullScreenDialog} onClose={() => setOpenDialog(false)}>
          <Box sx={{ p: 4, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <TextField
              fullWidth
              autoFocus
              variant='standard'
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder='Buscar módulo, chat, tickets, usuarios...'
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position='start' sx={{ color: 'text.primary' }}>
                    <Icon fontSize='1.5rem' icon='tabler:search' />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment
                    position='end'
                    onClick={() => setOpenDialog(false)}
                    sx={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}
                  >
                    {!hidden ? <Typography sx={{ mr: 2.5, color: 'text.disabled' }}>[esc]</Typography> : null}
                    <IconButton size='small' sx={{ p: 1 }}>
                      <Icon icon='tabler:x' fontSize='1.25rem' />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <Box sx={{ p: 4, overflowY: 'auto' }}>
            <Typography component='p' variant='overline' sx={{ mb: 2, color: 'text.disabled' }}>
              Módulos Disponibles
            </Typography>
            <List sx={{ py: 0 }}>
              {filteredRoutes.map(item => (
                <ListItem key={item.url} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.url}
                    onClick={() => handleOptionClick(item.url)}
                    sx={{ borderRadius: 1, py: 2.5 }}
                  >
                    <Box sx={{ mr: 3, display: 'flex', color: 'primary.main' }}>
                      <Icon icon={item.icon} fontSize='1.5rem' />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{item.title}</Typography>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        {item.subtitle}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
              {filteredRoutes.length === 0 && (
                <Typography variant='body2' sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                  No se encontraron resultados para &quot;{searchValue}&quot;
                </Typography>
              )}
            </List>
          </Box>
        </Dialog>
      )}
    </Box>
  )
}

export default AutocompleteComponent
