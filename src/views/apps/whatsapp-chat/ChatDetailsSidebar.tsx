// ** React Imports
import { ReactNode } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Third Party Components
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import Sidebar from 'src/@core/components/sidebar'
import CustomChip from 'src/@core/components/mui/chip'

// ** Types
import { ConversationItem } from './types'

interface Props {
  activeConv: ConversationItem | undefined
  open: boolean
  hidden: boolean
  sidebarWidth: number
  onClose: () => void
  onOpenOrderModal: () => void
}

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <Box sx={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
  }

  return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
}

const ChatDetailsSidebar = (props: Props) => {
  const { activeConv, open, hidden, sidebarWidth, onClose, onOpenOrderModal } = props

  return (
    <Sidebar
      direction='right'
      show={open}
      backDropClick={onClose}
      sx={{
        zIndex: 9,
        height: '100%',
        width: sidebarWidth,
        borderTopRightRadius: theme => theme.shape.borderRadius,
        borderBottomRightRadius: theme => theme.shape.borderRadius,
        '& + .MuiBackdrop-root': {
          zIndex: 8,
          borderRadius: 1
        }
      }}
    >
      {activeConv ? (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              px: 4,
              py: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: theme => `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              Ficha Técnica & Diagnóstico
            </Typography>
            <IconButton size='small' onClick={onClose}>
              <Icon icon='tabler:x' />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <ScrollWrapper hidden={hidden}>
              <Stack spacing={3} sx={{ p: 4 }}>
                {/* Card 1: Ticket & Diagnóstico IA */}
                <Card variant='outlined'>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Icon icon='tabler:robot' color='#ea580c' />
                        <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                          Dictamen & Ticket
                        </Typography>
                      </Stack>
                      {activeConv.ticket && (
                        <CustomChip rounded skin='light' size='small' color='primary' label={`#${activeConv.ticket.id}`} />
                      )}
                    </Box>

                    {activeConv.ticket ? (
                      <>
                        <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
                          {activeConv.ticket.title}
                        </Typography>
                        <Box
                          sx={{
                            p: 2.5,
                            borderRadius: 1,
                            mb: 2.5,
                            bgcolor: 'action.hover',
                            borderLeft: theme => `4px solid ${theme.palette.warning.main}`
                          }}
                        >
                          <Typography variant='caption' sx={{ fontWeight: 700, color: 'warning.main', display: 'block' }}>
                            Diagnóstico IA:
                          </Typography>
                          <Typography variant='body2' sx={{ mt: 0.5 }}>
                            {activeConv.ticket.aiDiagnostic}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                            <CustomChip
                              rounded
                              skin='light'
                              size='small'
                              color={activeConv.ticket.serviceType === 'ONSITE_PHYSICAL' ? 'error' : 'info'}
                              label={
                                activeConv.ticket.serviceType === 'ONSITE_PHYSICAL'
                                  ? 'Visita Presencial'
                                  : 'Remoto WhatsApp'
                              }
                            />
                            <CustomChip
                              rounded
                              skin='light'
                              size='small'
                              label={`Prioridad: ${activeConv.ticket.priority}`}
                            />
                          </Box>
                        </Box>

                        <Stack spacing={1.5}>
                          <Button
                            fullWidth
                            size='small'
                            variant='tonal'
                            color='secondary'
                            startIcon={<Icon icon='tabler:receipt' />}
                            onClick={onOpenOrderModal}
                          >
                            Notificar Orden de Servicio
                          </Button>
                          <Button
                            fullWidth
                            size='small'
                            component={Link}
                            href='/tickets'
                            variant='contained'
                            startIcon={<Icon icon='tabler:ticket' />}
                            endIcon={<Icon icon='tabler:external-link' />}
                          >
                            Ver en Tickets
                          </Button>
                        </Stack>
                      </>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 1 }}>
                        <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1.5 }}>
                          La IA creará un ticket automáticamente si detecta una incidencia que requiera derivación.
                        </Typography>
                        <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                          Para crear órdenes manuales utiliza HelpCopies ERP.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Card 2: Datos del Cliente */}
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 2 }}>
                      Datos del Cliente
                    </Typography>
                    <Stack spacing={1.5}>
                      <Stack direction='row' spacing={1.5} alignItems='center'>
                        <Icon icon='tabler:user' fontSize='1.125rem' />
                        <Typography variant='body2'>{activeConv.customer.name}</Typography>
                      </Stack>
                      <Stack direction='row' spacing={1.5} alignItems='center'>
                        <Icon icon='tabler:building' fontSize='1.125rem' />
                        <Typography variant='body2'>{activeConv.customer.company}</Typography>
                      </Stack>
                      <Stack direction='row' spacing={1.5} alignItems='center'>
                        <Icon icon='tabler:phone' fontSize='1.125rem' />
                        <Typography variant='body2'>{activeConv.customer.phone}</Typography>
                      </Stack>
                      <Stack direction='row' spacing={1.5} alignItems='center'>
                        <Icon icon='tabler:map-pin' fontSize='1.125rem' />
                        <Typography variant='body2'>{activeConv.customer.address}</Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Card 3: Equipos Registrados */}
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 2 }}>
                      Equipos Registrados ({activeConv.equipments.length})
                    </Typography>
                    <Stack spacing={2} divider={<Divider />}>
                      {activeConv.equipments.map((eq, index) => {
                        const isInIncidence = eq.status === 'IN_INCIDENCE'

                        return (
                          <Box key={index}>
                            <Stack direction='row' spacing={1} alignItems='center' justifyContent='space-between'>
                              <Typography variant='body2' sx={{ fontWeight: 700 }}>
                                {eq.name}
                              </Typography>
                              {isInIncidence && (
                                <CustomChip rounded skin='light' size='small' color='error' label='En Incidencia' />
                              )}
                            </Stack>
                            <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                              Marca / Modelo: {eq.brandModel}
                            </Typography>
                            <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                              N° Serie: {eq.serialNumber}
                            </Typography>
                            {eq.lastMaintenance && (
                              <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                                Último Mant.: {eq.lastMaintenance}
                              </Typography>
                            )}
                          </Box>
                        )
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </ScrollWrapper>
          </Box>
        </Box>
      ) : null}
    </Sidebar>
  )
}

export default ChatDetailsSidebar
