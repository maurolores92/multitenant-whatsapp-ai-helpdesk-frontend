// ** React Imports
import { useState, SyntheticEvent, Fragment } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'

// ** Context
import { useAuth } from 'src/hooks/useAuth'

// ** Type Imports
import { Settings } from 'src/@core/context/settingsContext'

interface Props {
  settings: Settings
}

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const MenuItemStyled = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
  '&:hover .MuiBox-root, &:hover .MuiBox-root svg': {
    color: theme.palette.primary.main
  }
}))

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrador',
  ADMIN: 'Administrador',
  TECHNICIAN: 'Técnico Especialista',
  AGENT: 'Operador Soporte'
}

const UserDropdown = (props: Props) => {
  // ** Props
  const { settings } = props

  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  // ** Hooks
  const router = useRouter()
  const { user, logout } = useAuth()

  // ** Vars
  const { direction } = settings

  const displayName = user?.name || user?.fullName || 'Usuario'
  const displayRole = roleLabels[user?.role || ''] || user?.role || 'Operador'

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = (url?: string) => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  const styles = {
    px: 4,
    py: 1.75,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2.5,
      fontSize: '1.5rem',
      color: 'text.secondary'
    }
  }

  const handleLogout = () => {
    logout()
    handleDropdownClose()
  }

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <CustomAvatar
          skin='light'
          color={user?.role === 'SUPER_ADMIN' ? 'info' : 'primary'}
          onClick={handleDropdownOpen}
          sx={{ width: 38, height: 38, fontWeight: 600 }}
        >
          {getInitials(displayName)}
        </CustomAvatar>
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 250, mt: 4.75 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <Box sx={{ py: 1.75, px: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
            >
              <CustomAvatar
                skin='light'
                color={user?.role === 'SUPER_ADMIN' ? 'info' : 'primary'}
                sx={{ width: '2.5rem', height: '2.5rem', fontWeight: 600 }}
              >
                {getInitials(displayName)}
              </CustomAvatar>
            </Badge>
            <Box sx={{ display: 'flex', ml: 2.5, alignItems: 'flex-start', flexDirection: 'column', overflow: 'hidden' }}>
              <Typography noWrap sx={{ fontWeight: 600, maxWidth: 160 }}>
                {displayName}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                {displayRole}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
        <Box sx={{ px: 5, py: 1 }}>
          <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }}>
            {user?.email}
          </Typography>
          <Typography variant='caption' sx={{ color: 'primary.main', fontWeight: 600 }}>
            {user?.tenant?.name || 'Administración Central'}
          </Typography>
        </Box>
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
        {user?.role === 'SUPER_ADMIN' ? (
          <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose('/companies')}>
            <Box sx={styles}>
              <Icon icon='tabler:building' />
              Compañías
            </Box>
          </MenuItemStyled>
        ) : (
          <>
            <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose('/dashboard')}>
              <Box sx={styles}>
                <Icon icon='tabler:smart-home' />
                Dashboard
              </Box>
            </MenuItemStyled>
            <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose('/chat')}>
              <Box sx={styles}>
                <Icon icon='tabler:brand-whatsapp' />
                WhatsApp Chat
              </Box>
            </MenuItemStyled>
            <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose('/tickets')}>
              <Box sx={styles}>
                <Icon icon='tabler:ticket' />
                Tickets & IA
              </Box>
            </MenuItemStyled>
          </>
        )}
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
        <MenuItemStyled sx={{ p: 0 }} onClick={handleLogout}>
          <Box sx={{ ...styles, color: 'error.main', '& svg': { mr: 2.5, fontSize: '1.5rem', color: 'error.main' } }}>
            <Icon icon='tabler:logout' />
            Cerrar Sesión
          </Box>
        </MenuItemStyled>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
