// ** React Imports
import { useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Types
import { ConversationItem } from './types'

interface Props {
  activeConv: ConversationItem | undefined
  currentUserName: string
  inputMessage: string
  onInputChange: (val: string) => void
  onSendMessage: () => void
  onTakeOver: () => void
  onReleaseToBot: () => void
  mdAbove: boolean
  onToggleLeftSidebar: () => void
  onToggleRightSidebar: () => void
}

const ChatMainContent = (props: Props) => {
  const {
    activeConv,
    currentUserName,
    inputMessage,
    onInputChange,
    onSendMessage,
    onTakeOver,
    onReleaseToBot,
    mdAbove,
    onToggleLeftSidebar,
    onToggleRightSidebar
  } = props

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages])

  if (!activeConv) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: 'action.hover'
        }}
      >
        <CustomAvatar skin='light' color='primary' sx={{ width: 96, height: 96, mb: 4 }}>
          <Icon icon='tabler:brand-whatsapp' fontSize='3rem' />
        </CustomAvatar>
        <Typography variant='h5' sx={{ mb: 1 }}>
          Selecciona una conversación
        </Typography>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          Elige un chat de WhatsApp para visualizar el historial y responder en vivo.
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: 0,
        flexGrow: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'action.hover'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 5,
          py: 2.5,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          backgroundColor: 'background.paper',
          borderBottom: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!mdAbove && (
            <IconButton onClick={onToggleLeftSidebar}>
              <Icon icon='tabler:menu-2' />
            </IconButton>
          )}
          <Box onClick={onToggleRightSidebar} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 3 }}>
            <CustomAvatar skin='light' color='success' sx={{ width: 38, height: 38, fontWeight: 600 }}>
              {activeConv.customer.initials}
            </CustomAvatar>
            <Box>
              <Typography variant='h6'>
                {activeConv.customer.name} ({activeConv.customer.company})
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                {activeConv.customer.phone} • {activeConv.equipments[0]?.name || 'Equipo general'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {activeConv.status === 'AGENT_HANDLING' ? (
            <>
              <CustomChip
                rounded
                skin='light'
                size='small'
                color='success'
                icon={<Icon icon='tabler:user-check' fontSize='0.95rem' />}
                label={`Atendido por: ${activeConv.assignedUser?.name || currentUserName}`}
              />
              <Tooltip title='Silencia tu control y reactiva las respuestas automáticas de la IA' arrow>
                <Button
                  size='small'
                  variant='outlined'
                  color='secondary'
                  startIcon={<Icon icon='tabler:robot' />}
                  onClick={onReleaseToBot}
                >
                  Devolver a IA
                </Button>
              </Tooltip>
            </>
          ) : (
            <>
              <CustomChip
                rounded
                skin='light'
                size='small'
                color={activeConv.status === 'WAITING_AGENT' ? 'warning' : 'info'}
                icon={<Icon icon='tabler:robot' fontSize='0.95rem' />}
                label={activeConv.status === 'WAITING_AGENT' ? 'Requiere Atención Técnica' : 'IA Respondiendo en Vivo'}
              />
              <Tooltip title='Pausa la IA y toma el control directo de la conversación' arrow>
                <Button
                  size='small'
                  variant='contained'
                  color='success'
                  startIcon={<Icon icon='tabler:headset' />}
                  onClick={onTakeOver}
                >
                  Tomar Conversación
                </Button>
              </Tooltip>
            </>
          )}

          <Tooltip title='Ficha del cliente, equipos y ticket'>
            <IconButton size='small' onClick={onToggleRightSidebar}>
              <Icon icon='tabler:layout-sidebar-right' />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
        <Stack spacing={2.5}>
          {activeConv.messages.map(msg => {
            const isCustomer = msg.senderType === 'CUSTOMER'
            const isBot = msg.senderType === 'BOT'
            const isAgent = msg.senderType === 'AGENT'
            const isSystem = msg.senderType === 'SYSTEM'

            if (isSystem) {
              return (
                <Box key={msg.id} sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                  <Chip size='small' variant='outlined' label={`${msg.content} • ${msg.time}`} />
                </Box>
              )
            }

            return (
              <Box
                key={msg.id}
                sx={{
                  alignSelf: isCustomer ? 'flex-start' : 'flex-end',
                  maxWidth: { xs: '90%', sm: '75%' }
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: isCustomer ? 'background.paper' : isBot ? 'info.light' : 'primary.main',
                    color: isCustomer ? 'text.primary' : 'common.white',
                    ...(isBot && {
                      bgcolor: theme =>
                        theme.palette.mode === 'light' ? 'rgba(0, 207, 232, 0.14)' : 'rgba(0, 207, 232, 0.22)',
                      color: 'text.primary',
                      borderLeft: theme => `4px solid ${theme.palette.info.main}`
                    }),
                    ...(isAgent && {
                      bgcolor: 'primary.main',
                      color: 'common.white'
                    })
                  }}
                >
                  <Stack direction='row' spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    {isBot && <Icon icon='tabler:robot' fontSize='1rem' />}
                    {isAgent && <Icon icon='tabler:user-check' fontSize='1rem' />}
                    <Typography
                      variant='caption'
                      sx={{
                        fontWeight: 700,
                        color: isAgent ? 'common.white' : isBot ? 'info.main' : 'text.secondary'
                      }}
                    >
                      {msg.senderName}
                    </Typography>
                  </Stack>

                  <Typography
                    variant='body2'
                    sx={{
                      whiteSpace: 'pre-wrap',
                      color: isAgent ? 'common.white' : 'text.primary'
                    }}
                  >
                    {msg.content}
                  </Typography>

                  <Box sx={{ textAlign: 'right', mt: 1 }}>
                    <Typography
                      variant='caption'
                      sx={{
                        fontSize: '0.68rem',
                        color: isAgent ? 'rgba(255,255,255,0.8)' : 'text.disabled'
                      }}
                    >
                      {msg.time}
                      {isAgent && ' • Firma de operador'}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )
          })}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 3,
          backgroundColor: 'background.paper',
          borderTop: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        {activeConv.status === 'BOT_HANDLING' ? (
          <Alert severity='info' sx={{ py: 0.5, mb: 2, fontSize: '0.78rem' }}>
            La IA está respondiendo automáticamente. Si escribes un mensaje, tomarás el control y pausarás al bot.
          </Alert>
        ) : (
          <Alert severity='success' sx={{ py: 0.5, mb: 2, fontSize: '0.78rem' }}>
            Estás en control del chat. Tu mensaje se enviará por WhatsApp firmado a nombre de{' '}
            <strong>{currentUserName}</strong>.
          </Alert>
        )}

        <Stack direction='row' spacing={2} alignItems='center'>
          <CustomTextField
            fullWidth
            value={inputMessage}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSendMessage()}
            placeholder={
              activeConv.status === 'BOT_HANDLING'
                ? 'Escribe para intervenir y responder como operador humano...'
                : 'Escribe tu respuesta técnica oficial por WhatsApp...'
            }
          />
          <Button
            variant='contained'
            color='success'
            onClick={onSendMessage}
            endIcon={<Icon icon='tabler:send' />}
            sx={{ px: 5, py: 2, flexShrink: 0 }}
          >
            Enviar
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}

export default ChatMainContent
