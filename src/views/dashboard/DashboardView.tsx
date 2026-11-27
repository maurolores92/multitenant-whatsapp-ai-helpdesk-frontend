// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import Button from '@mui/material/Button'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TableContainer from '@mui/material/TableContainer'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'

// ** API & Hooks
import api from 'src/configs/api'
import { useAuth } from 'src/hooks/useAuth'

interface RecentTicketRow {
  id: string
  customer: string
  equipment: string
  serviceType: 'ONSITE_PHYSICAL' | 'REMOTE_WHATSAPP'
  priority: string
  status: string
  aiDiagnostic: string
  time: string
}

const FALLBACK_TICKETS: RecentTicketRow[] = [
  {
    id: 'TCK-1042',
    customer: 'Sanatorio San Lucas S.R.L.',
    equipment: 'Ecoflex 3000 (S/N: ECO-9923)',
    serviceType: 'ONSITE_PHYSICAL',
    priority: 'HIGH',
    status: 'OPEN',
    aiDiagnostic: 'Riesgo eléctrico. Se requiere técnico presencial con multímetro y fusible de 15A.',
    time: 'Hace 10 min'
  },
  {
    id: 'TCK-1041',
    customer: 'Laboratorio BioTest',
    equipment: 'Centrifugadora C-20 (S/N: CEN-4412)',
    serviceType: 'REMOTE_WHATSAPP',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    aiDiagnostic: 'Problema de configuración en menú de servicio. Guiar reseteo remoto.',
    time: 'Hace 25 min'
  },
  {
    id: 'TCK-1040',
    customer: 'Clínica Las Palmeras',
    equipment: 'Monitor Multiparamétrico MP-50',
    serviceType: 'REMOTE_WHATSAPP',
    priority: 'LOW',
    status: 'RESOLVED',
    aiDiagnostic: 'Sensor desconectado físicamente en puerto 2.',
    time: 'Hace 1 hora'
  }
]

const DashboardView = () => {
  const { user } = useAuth()
  const [recentTickets, setRecentTickets] = useState<RecentTicketRow[]>(FALLBACK_TICKETS)
  const [stats, setStats] = useState({
    activeChats: 14,
    waitingChats: 3,
    aiTickets: 8,
    highPriority: 6,
    onsiteVisits: 5,
    resolvedTickets: 4
  })

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [ticketsRes, chatsRes] = await Promise.all([
          api.get('/tickets').catch(() => ({ data: [] })),
          api.get('/chat/conversations').catch(() => ({ data: [] }))
        ])

        const ticketsData = Array.isArray(ticketsRes.data) ? ticketsRes.data : []
        const chatsData = Array.isArray(chatsRes.data) ? chatsRes.data : []

        if (ticketsData.length > 0) {
          setRecentTickets(
            ticketsData.slice(0, 6).map((t: any) => ({
              id: t.id ? (t.id.startsWith('TCK') ? t.id : `TCK-${t.id.slice(-4).toUpperCase()}`) : 'TCK-0000',
              customer: t.customer?.name || 'Cliente WhatsApp',
              equipment: t.equipment?.name
                ? `${t.equipment.name} (${t.equipment.serialNumber || 'S/N'})`
                : 'Equipo General',
              serviceType: t.serviceType || 'REMOTE_WHATSAPP',
              priority: t.priority || 'MEDIUM',
              status: t.status || 'OPEN',
              aiDiagnostic: t.aiDiagnostic || t.description || 'Sin diagnóstico registrado.',
              time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
          )
        }

        if (ticketsData.length > 0 || chatsData.length > 0) {
          const activeChats = chatsData.filter((c: any) => c.status !== 'RESOLVED').length
          const waitingChats = chatsData.filter((c: any) => c.status === 'WAITING_AGENT').length
          const highPriority = ticketsData.filter(
            (t: any) => t.priority === 'HIGH' || t.priority === 'CRITICAL'
          ).length
          const onsiteVisits = ticketsData.filter((t: any) => t.serviceType === 'ONSITE_PHYSICAL').length
          const resolvedTickets = ticketsData.filter((t: any) => t.status === 'RESOLVED').length

          setStats({
            activeChats,
            waitingChats,
            aiTickets: ticketsData.length,
            highPriority,
            onsiteVisits,
            resolvedTickets
          })
        }
      } catch {
        // Fallback silencioso a valores iniciales
      }
    }

    loadDashboardData()
  }, [])

  return (
    <Grid container spacing={6}>
      {/* Banner de Bienvenida */}
      <Grid item xs={12}>
        <Card>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 4
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <CustomAvatar skin='light' variant='rounded' color='primary' sx={{ width: 52, height: 52 }}>
                <Icon icon='tabler:robot' fontSize='1.75rem' />
              </CustomAvatar>
              <Box>
                <Typography variant='h4' sx={{ mb: 0.5 }}>
                  Panel de Control & Soporte Técnico IA
                </Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  {user?.tenant?.name ? `${user.tenant.name} — ` : ''}
                  Monitoreo en vivo de WhatsApp Cloud API, triaje automatizado por IA y órdenes de servicio
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href='/chat'
                variant='contained'
                color='success'
                startIcon={<Icon icon='tabler:brand-whatsapp' />}
              >
                Bandeja WhatsApp
              </Button>
              <Button
                component={Link}
                href='/tickets'
                variant='outlined'
                startIcon={<Icon icon='tabler:ticket' />}
              >
                Ver Tickets
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* KPI Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(stats.activeChats)}
          trend='positive'
          trendDiff='+12'
          title='Chats WhatsApp Activos'
          subtitle={`${stats.waitingChats} esperando respuesta`}
          avatarColor='success'
          icon='tabler:brand-whatsapp'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(stats.aiTickets)}
          trend='positive'
          trendDiff='+8'
          title='Tickets Escalados por IA'
          subtitle={`${stats.highPriority} con prioridad alta/crítica`}
          avatarColor='info'
          icon='tabler:robot'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(stats.onsiteVisits)}
          trend='negative'
          trendDiff='-2'
          title='Visitas Físicas en Local'
          subtitle='Coordinadas para atención'
          avatarColor='warning'
          icon='tabler:map-pin'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(stats.resolvedTickets)}
          trend='positive'
          trendDiff='+18'
          title='Tickets Resueltos'
          subtitle='Triaje y cierre exitoso'
          avatarColor='primary'
          icon='tabler:circle-check'
        />
      </Grid>

      {/* Recent AI Tickets Table */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Últimos Casos Diagnosticados por la IA'
            subheader='Triaje Nivel 1 ejecutado tras interacción por WhatsApp'
            action={
              <Button
                component={Link}
                href='/tickets'
                size='small'
                variant='tonal'
                endIcon={<Icon icon='tabler:arrow-right' />}
              >
                Ver todos
              </Button>
            }
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket</TableCell>
                  <TableCell>Cliente / Razón Social</TableCell>
                  <TableCell>Equipo Involucrado</TableCell>
                  <TableCell>Modalidad Determinada</TableCell>
                  <TableCell>Diagnóstico de la IA</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTickets.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {row.id}
                      </Typography>
                      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                        {row.time}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {row.customer}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{row.equipment}</Typography>
                    </TableCell>
                    <TableCell>
                      <CustomChip
                        rounded
                        skin='light'
                        size='small'
                        color={row.serviceType === 'ONSITE_PHYSICAL' ? 'error' : 'info'}
                        label={row.serviceType === 'ONSITE_PHYSICAL' ? 'Visita Presencial' : 'Remoto WhatsApp'}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {row.aiDiagnostic}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <CustomChip
                        rounded
                        skin='light'
                        size='small'
                        label={
                          row.status === 'OPEN'
                            ? 'Pendiente'
                            : row.status === 'ASSIGNED' || row.status === 'IN_PROGRESS'
                            ? 'En Atención'
                            : 'Resuelto'
                        }
                        color={
                          row.status === 'OPEN'
                            ? 'warning'
                            : row.status === 'ASSIGNED' || row.status === 'IN_PROGRESS'
                            ? 'primary'
                            : 'success'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>
    </Grid>
  )
}

export default DashboardView
