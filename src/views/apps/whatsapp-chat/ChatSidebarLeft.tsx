// ** React Imports
import { ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Badge from '@mui/material/Badge'
import Drawer from '@mui/material/Drawer'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import InputAdornment from '@mui/material/InputAdornment'
import Tooltip from '@mui/material/Tooltip'

// ** Third Party Components
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Types
import { ConversationItem } from './types'

interface Props {
  conversations: ConversationItem[]
  selectedConvId: string
  searchQuery: string
  onSearchChange: (q: string) => void
  onSelectConv: (id: string) => void
  onRefresh: () => void
  isRefreshing: boolean
  mdAbove: boolean
  hidden: boolean
  leftSidebarOpen: boolean
  onToggleLeftSidebar: () => void
  sidebarWidth: number
  operatorName: string
  operatorInitials: string
}

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <Box sx={{ height: '100%', overflow: 'auto' }}>{children}</Box>
  }

  return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
}

const ChatSidebarLeft = (props: Props) => {
  const {
    conversations,
    selectedConvId,
    searchQuery,
    onSearchChange,
    onSelectConv,
    onRefresh,
    isRefreshing,
    mdAbove,
    hidden,
    leftSidebarOpen,
    onToggleLeftSidebar,
    sidebarWidth,
    operatorName,
    operatorInitials
  } = props

  const filtered = conversations.filter(c => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true

    return (
      c.customer.name.toLowerCase().includes(q) ||
      c.customer.company.toLowerCase().includes(q) ||
      c.customer.phone.toLowerCase().includes(q)
    )
  })

  return (
    <Drawer
      open={leftSidebarOpen}
      onClose={onToggleLeftSidebar}
      variant={mdAbove ? 'permanent' : 'temporary'}
      ModalProps={{ disablePortal: true, keepMounted: true }}
      sx={{
        zIndex: 7,
        height: '100%',
        display: 'block',
        position: mdAbove ? 'static' : 'absolute',
        '& .MuiDrawer-paper': {
          boxShadow: 'none',
          width: sidebarWidth,
          position: mdAbove ? 'static' : 'absolute',
          borderTopLeftRadius: theme => theme.shape.borderRadius,
          borderBottomLeftRadius: theme => theme.shape.borderRadius
        },
        '& > .MuiBackdrop-root': {
          borderRadius: 1,
          position: 'absolute',
          zIndex: theme => theme.zIndex.drawer - 1
        }
      }}
    >
      {/* Top Operator & Search */}
      <Box
        sx={{
          py: 3,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
          borderBottom: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        <Tooltip title={`Conectado: ${operatorName}`}>
          <Badge
            overlap='circular'
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                component='span'
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                  boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`
                }}
              />
            }
          >
            <CustomAvatar skin='light' color='primary' sx={{ width: 38, height: 38, fontWeight: 600 }}>
              {operatorInitials}
            </CustomAvatar>
          </Badge>
        </Tooltip>

        <CustomTextField
          fullWidth
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder='Buscar cliente o teléfono...'
          sx={{ '& .MuiInputBase-root': { borderRadius: '30px !important' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start' sx={{ color: 'text.secondary' }}>
                <Icon fontSize='1.125rem' icon='tabler:search' />
              </InputAdornment>
            )
          }}
        />

        <Tooltip title='Actualizar conversaciones'>
          <IconButton size='small' onClick={onRefresh} disabled={isRefreshing}>
            <Icon icon='tabler:refresh' fontSize='1.25rem' />
          </IconButton>
        </Tooltip>

        {!mdAbove && (
          <IconButton size='small' onClick={onToggleLeftSidebar}>
            <Icon icon='tabler:x' />
          </IconButton>
        )}
      </Box>

      {/* Conversations List */}
      <Box sx={{ height: 'calc(100% - 4.1rem)' }}>
        <ScrollWrapper hidden={hidden}>
          <Box sx={{ p: theme => theme.spacing(4, 3) }}>
            <Typography variant='h6' sx={{ ml: 2, mb: 2.5, color: 'primary.main', fontWeight: 600 }}>
              Bandeja WhatsApp ({filtered.length})
            </Typography>
            <List sx={{ p: 0 }}>
              {filtered.length === 0 ? (
                <ListItem>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    No se encontraron conversaciones
                  </Typography>
                </ListItem>
              ) : (
                filtered.map(conv => {
                  const isSelected = conv.id === selectedConvId
                  const isBot = conv.status === 'BOT_HANDLING'
                  const isWaiting = conv.status === 'WAITING_AGENT'

                  return (
                    <ListItem key={conv.id} disablePadding sx={{ '&:not(:last-child)': { mb: 1 } }}>
                      <ListItemButton
                        disableRipple
                        onClick={() => {
                          onSelectConv(conv.id)
                          if (!mdAbove) onToggleLeftSidebar()
                        }}
                        sx={{
                          py: 2.25,
                          px: 3,
                          width: '100%',
                          borderRadius: 1,
                          alignItems: 'flex-start',
                          '&.MuiListItemButton-root:hover': { backgroundColor: 'action.hover' },
                          ...(isSelected && {
                            background: theme =>
                              `linear-gradient(72.47deg, ${theme.palette.primary.main} 22.16%, ${hexToRGBA(
                                theme.palette.primary.main,
                                0.7
                              )} 76.47%) !important`
                          })
                        }}
                      >
                        <ListItemAvatar sx={{ m: 0, alignSelf: 'center' }}>
                          <CustomAvatar
                            color={isSelected ? 'primary' : isWaiting ? 'warning' : 'success'}
                            skin={isSelected ? 'light-static' : 'light'}
                            sx={{
                              width: 40,
                              height: 40,
                              fontWeight: 600,
                              outline: theme => `2px solid ${isSelected ? theme.palette.common.white : 'transparent'}`
                            }}
                          >
                            {conv.customer.initials}
                          </CustomAvatar>
                        </ListItemAvatar>
                        <ListItemText
                          sx={{
                            my: 0,
                            ml: 3,
                            mr: 1.5,
                            '& .MuiTypography-root': { ...(isSelected && { color: 'common.white' }) }
                          }}
                          primary={
                            <Typography noWrap variant='subtitle1' sx={{ fontWeight: 600 }}>
                              {conv.customer.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                noWrap
                                variant='caption'
                                sx={{ display: 'block', ...(!isSelected && { color: 'text.secondary' }) }}
                              >
                                {conv.lastMessagePreview}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <CustomChip
                                  rounded
                                  size='small'
                                  skin='light'
                                  color={isBot ? 'info' : isWaiting ? 'warning' : 'success'}
                                  label={
                                    isBot
                                      ? 'IA Activa'
                                      : isWaiting
                                      ? 'Requiere Técnico'
                                      : conv.assignedUser?.name
                                      ? `Atiende: ${conv.assignedUser.name.split(' ')[0]}`
                                      : 'Operador'
                                  }
                                  sx={{
                                    height: 20,
                                    fontSize: '0.68rem',
                                    ...(isSelected && {
                                      bgcolor: 'rgba(255,255,255,0.22)',
                                      color: 'common.white'
                                    })
                                  }}
                                />
                              </Box>
                            </Box>
                          }
                        />
                        <Typography
                          variant='caption'
                          sx={{ whiteSpace: 'nowrap', color: isSelected ? 'common.white' : 'text.disabled' }}
                        >
                          {conv.lastMessageTime}
                        </Typography>
                      </ListItemButton>
                    </ListItem>
                  )
                })
              )}
            </List>
          </Box>
        </ScrollWrapper>
      </Box>
    </Drawer>
  )
}

export default ChatSidebarLeft
