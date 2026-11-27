// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import Tooltip from '@mui/material/Tooltip'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import TableContainer from '@mui/material/TableContainer'
import CircularProgress from '@mui/material/CircularProgress'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'

// ** API & Subcomponents
import api from 'src/configs/api'
import { TenantItem } from './types'
import TenantActionModals, { CompanyModalType } from './TenantActionModals'

const CompaniesView = () => {
  const [tenants, setTenants] = useState<TenantItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeModal, setActiveModal] = useState<{ type: CompanyModalType; tenant: TenantItem } | null>(null)

  const fetchTenants = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/tenants')
      const data: TenantItem[] = Array.isArray(res.data) ? res.data : []
      setTenants(data)
      setActiveModal(prev => {
        if (!prev) return null
        const updated = data.find(t => t.id === prev.tenant.id)

        return updated ? { ...prev, tenant: updated } : prev
      })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al cargar compañías')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  const totalUsers = tenants.reduce((acc, t) => acc + (t._count?.users || 0), 0)
  const totalCustomers = tenants.reduce((acc, t) => acc + (t._count?.customers || 0), 0)
  const totalTickets = tenants.reduce((acc, t) => acc + (t._count?.tickets || 0), 0)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(tenants.length)}
          trend='positive'
          trendDiff='Única'
          title='Empresa Activa'
          subtitle='Modo Mono-Empresa Protegido'
          avatarColor='info'
          icon='tabler:building'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(totalUsers)}
          trend='positive'
          trendDiff='Equipo'
          title='Usuarios Totales'
          subtitle='Admins y técnicos'
          avatarColor='success'
          icon='tabler:users'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(totalCustomers)}
          trend='positive'
          trendDiff='Meta API'
          title='Clientes WhatsApp'
          subtitle='Contactos registrados'
          avatarColor='warning'
          icon='tabler:brand-whatsapp'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(totalTickets)}
          trend='positive'
          trendDiff='IA'
          title='Tickets Totales'
          subtitle='Incidencias gestionadas'
          avatarColor='primary'
          icon='tabler:ticket'
        />
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Empresa Principal & Agentes (HelpCopies SRL)'
            subheader='La empresa principal generada por el sistema está protegida: no se puede eliminar ni crear otras compañías manualmente'
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Compañía</TableCell>
                  <TableCell>Línea WhatsApp</TableCell>
                  <TableCell>Usuarios</TableCell>
                  <TableCell>Clientes / Tickets</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align='right'>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center' sx={{ py: 8 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center' sx={{ py: 8 }}>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        Aún no hay compañías registradas.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map(t => {
                    const hasMeta = Boolean(t.whatsappPhoneNumberId)

                    return (
                      <TableRow key={t.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <CustomAvatar skin='light' color='info' variant='rounded' sx={{ width: 38, height: 38 }}>
                              <Icon icon='tabler:building' />
                            </CustomAvatar>
                            <Box>
                              <Typography variant='body2' sx={{ fontWeight: 700 }}>
                                {t.name}
                              </Typography>
                              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                Slug: {t.slug}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{t.whatsappPhone || 'No asignado'}</Typography>
                          <CustomChip
                            rounded
                            skin='light'
                            size='small'
                            label={hasMeta ? 'API Oficial' : 'Modo Interno'}
                            color={hasMeta ? 'success' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>
                          <CustomChip rounded skin='light' size='small' color='info' label={`${t._count?.users || 0} usuarios`} />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>
                            {t._count?.customers || 0} clientes • {t._count?.tickets || 0} tickets
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <CustomChip
                              rounded
                              skin='light'
                              size='small'
                              label={t.isActive ? 'Activa' : 'Inactiva'}
                              color={t.isActive ? 'success' : 'error'}
                            />
                            {(t.isSystem || t.slug === 'helpcopies') && (
                              <CustomChip
                                rounded
                                skin='light'
                                size='small'
                                label='Protegida'
                                color='primary'
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align='right'>
                          <Tooltip title='Usuarios de la Compañía'>
                            <IconButton
                              size='small'
                              color='info'
                              onClick={() => setActiveModal({ type: 'users', tenant: t })}
                            >
                              <Icon icon='tabler:users' fontSize='1.125rem' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Configurar WhatsApp'>
                            <IconButton
                              size='small'
                              color='success'
                              onClick={() => setActiveModal({ type: 'whatsapp', tenant: t })}
                            >
                              <Icon icon='tabler:brand-whatsapp' fontSize='1.125rem' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Entrenamiento & Reglas IA'>
                            <IconButton
                              size='small'
                              color='primary'
                              onClick={() => setActiveModal({ type: 'ai', tenant: t })}
                            >
                              <Icon icon='tabler:robot' fontSize='1.125rem' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Conexión HelpCopies ERP (ETL)'>
                            <IconButton
                              size='small'
                              color='warning'
                              onClick={() => setActiveModal({ type: 'erp', tenant: t })}
                            >
                              <Icon icon='tabler:database-import' fontSize='1.125rem' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>

      <TenantActionModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onRefresh={fetchTenants}
      />
    </Grid>
  )
}

export default CompaniesView
