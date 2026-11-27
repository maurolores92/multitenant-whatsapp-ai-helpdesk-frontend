// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** API & Types
import api from 'src/configs/api'
import { TenantItem } from './types'

interface Props {
  tenant: TenantItem
  onRefresh?: () => void
}

interface ErpProblemPreview {
  id: string
  externalCode?: string | null
  name: string
  defaultReason: string
}

const TenantErpSyncTab = ({ tenant, onRefresh }: Props) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const [form, setForm] = useState({
    baseUrl: 'https://api.helpcopies.com/api',
    authType: 'BEARER_TOKEN' as 'NONE' | 'BEARER_TOKEN' | 'API_KEY' | 'LOGIN_CREDENTIALS',
    apiKey: '',
    apiKeyHeader: 'x-api-key',
    loginEndpoint: '/auth/login',
    username: '',
    password: '',
    customersEndpoint: '/clients',
    equipmentsEndpoint: '/machines',
    problemsEndpoint: '/problems',
    autoSyncMonthly: true,
    isActive: false
  })

  const [stats, setStats] = useState({ customersCount: 0, equipmentsCount: 0, problemsCount: 0 })
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)
  const [lastSyncStatus, setLastSyncStatus] = useState<string | null>(null)
  const [lastSyncSummary, setLastSyncSummary] = useState<any>(null)
  const [problems, setProblems] = useState<ErpProblemPreview[]>([])
  const [testResult, setTestResult] = useState<any>(null)

  const loadConfig = useCallback(async () => {
    setLoading(true)
    try {
      const [cfgRes, probRes] = await Promise.all([
        api.get(`/tenants/${tenant.id}/erp-sync/config`),
        api.get(`/tenants/${tenant.id}/erp-sync/problems`).catch(() => ({ data: [] }))
      ])

      const cfg = cfgRes.data?.config
      if (cfg) {
        setForm({
          baseUrl: cfg.baseUrl || 'https://api.helpcopies.com/api',
          authType: cfg.authType || 'BEARER_TOKEN',
          apiKey: cfg.apiKey || '',
          apiKeyHeader: cfg.apiKeyHeader || 'x-api-key',
          loginEndpoint: cfg.loginEndpoint || '/auth/login',
          username: cfg.username || '',
          password: cfg.password || '',
          customersEndpoint: cfg.customersEndpoint || '/clients',
          equipmentsEndpoint: cfg.equipmentsEndpoint || '/machines',
          problemsEndpoint: cfg.problemsEndpoint || '/problems',
          autoSyncMonthly: cfg.autoSyncMonthly ?? true,
          isActive: cfg.isActive ?? false
        })
        setLastSyncAt(cfg.lastSyncAt || null)
        setLastSyncStatus(cfg.lastSyncStatus || null)
        setLastSyncSummary(cfg.lastSyncSummary || null)
      }

      setStats(cfgRes.data?.stats || { customersCount: 0, equipmentsCount: 0, problemsCount: 0 })
      setProblems(Array.isArray(probRes.data) ? probRes.data : [])
    } catch {
      toast.error('No se pudo cargar la configuración ERP')
    } finally {
      setLoading(false)
    }
  }, [tenant.id])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch(`/tenants/${tenant.id}/erp-sync/config`, form)
      toast.success('Configuración de HelpCopies ERP guardada')
      loadConfig()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al guardar configuración ERP')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      await api.patch(`/tenants/${tenant.id}/erp-sync/config`, form)
      const res = await api.post(`/tenants/${tenant.id}/erp-sync/test-connection`)
      setTestResult(res.data)
      toast.success('Conexión verificada contra HelpCopies ERP')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falló la prueba de conexión con HelpCopies ERP')
    } finally {
      setTesting(false)
    }
  }

  const handleRunSync = async () => {
    setSyncing(true)
    try {
      await api.patch(`/tenants/${tenant.id}/erp-sync/config`, form)
      const res = await api.post(`/tenants/${tenant.id}/erp-sync/run`)
      const s = res.data
      toast.success(
        `ETL completado: +${s.customersCreated} clientes, +${s.equipmentsCreated} equipos, +${s.problemsCreated} problemas`
      )
      loadConfig()
      onRefresh?.()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al ejecutar sincronización ETL')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity='info'>
        Conecta este espacio con tu backend de <strong>HelpCopies ERP</strong> para importar automáticamente{' '}
        <strong>Clientes</strong> (por código externo / <code>COD_CLIENT</code>), <strong>Equipos</strong> asociados a
        cada cliente y el <strong>Catálogo de Problemas</strong> que usa la IA al crear tickets.
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Paper variant='outlined' sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'primary.main' }}>
              {stats.customersCount}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              Clientes Locales
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper variant='outlined' sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'info.main' }}>
              {stats.equipmentsCount}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              Equipos Vinculados
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper variant='outlined' sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'success.main' }}>
              {stats.problemsCount}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              Problemas ERP
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={8}>
          <CustomTextField
            fullWidth
            label='URL Base del Backend HelpCopies ERP'
            placeholder='https://api.helpcopies.com/api'
            value={form.baseUrl}
            onChange={e => setForm({ ...form, baseUrl: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomTextField
            select
            fullWidth
            label='Autenticación ERP'
            value={form.authType}
            onChange={e => setForm({ ...form, authType: e.target.value as any })}
          >
            <MenuItem value='BEARER_TOKEN'>Token Bearer (JWT / API)</MenuItem>
            <MenuItem value='API_KEY'>Header API Key</MenuItem>
            <MenuItem value='LOGIN_CREDENTIALS'>Login Usuario + Password</MenuItem>
            <MenuItem value='NONE'>Sin Autenticación (Red Interna)</MenuItem>
          </CustomTextField>
        </Grid>

        {(form.authType === 'BEARER_TOKEN' || form.authType === 'API_KEY') && (
          <>
            <Grid item xs={12} sm={form.authType === 'API_KEY' ? 8 : 12}>
              <CustomTextField
                fullWidth
                type='password'
                label={form.authType === 'BEARER_TOKEN' ? 'Bearer Token' : 'Valor de API Key'}
                value={form.apiKey}
                onChange={e => setForm({ ...form, apiKey: e.target.value })}
              />
            </Grid>
            {form.authType === 'API_KEY' && (
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  label='Nombre del Header'
                  value={form.apiKeyHeader}
                  onChange={e => setForm({ ...form, apiKeyHeader: e.target.value })}
                />
              </Grid>
            )}
          </>
        )}

        {form.authType === 'LOGIN_CREDENTIALS' && (
          <>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                label='Endpoint Login'
                value={form.loginEndpoint}
                onChange={e => setForm({ ...form, loginEndpoint: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                label='Usuario ERP'
                placeholder='Ej: admin o usuario_etl'
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                type='password'
                label='Contraseña ERP'
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12} sm={4}>
          <CustomTextField
            fullWidth
            label='Endpoint Clientes'
            value={form.customersEndpoint}
            onChange={e => setForm({ ...form, customersEndpoint: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomTextField
            fullWidth
            label='Endpoint Equipos'
            value={form.equipmentsEndpoint}
            onChange={e => setForm({ ...form, equipmentsEndpoint: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomTextField
            fullWidth
            label='Endpoint Problemas'
            value={form.problemsEndpoint}
            onChange={e => setForm({ ...form, problemsEndpoint: e.target.value })}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <FormControlLabel
          control={<Switch checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />}
          label='Integración Activa'
        />
        <FormControlLabel
          control={
            <Switch
              checked={form.autoSyncMonthly}
              onChange={e => setForm({ ...form, autoSyncMonthly: e.target.checked })}
            />
          }
          label='ETL Automático Mensual (día 1 de cada mes)'
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant='outlined' onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
        <Button
          variant='tonal'
          color='info'
          startIcon={<Icon icon='tabler:plug-connected' />}
          onClick={handleTest}
          disabled={testing || !form.baseUrl.trim()}
        >
          {testing ? 'Probando...' : 'Probar Conexión'}
        </Button>
        <Button
          variant='contained'
          color='success'
          startIcon={<Icon icon='tabler:refresh' />}
          onClick={handleRunSync}
          disabled={syncing || !form.baseUrl.trim()}
        >
          {syncing ? 'Sincronizando ETL...' : 'Sincronizar Ahora'}
        </Button>
      </Box>

      {testResult && (
        <Alert severity='success'>
          <strong>Conexión OK:</strong> {testResult.customersDetected} clientes, {testResult.equipmentsDetected}{' '}
          equipos y {testResult.problemsDetected} problemas detectados en el backend ERP.
        </Alert>
      )}

      {lastSyncAt && (
        <Paper variant='outlined' sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
              Último ETL Ejecutado: {new Date(lastSyncAt).toLocaleString('es-AR')}
            </Typography>
            <CustomChip
              rounded
              skin='light'
              size='small'
              color={lastSyncStatus === 'SUCCESS' ? 'success' : lastSyncStatus === 'PARTIAL' ? 'warning' : 'error'}
              label={lastSyncStatus || 'DESCONOCIDO'}
            />
          </Box>
          {lastSyncSummary && (
            <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
              Clientes: +{lastSyncSummary.customersCreated || 0} nuevos / {lastSyncSummary.customersUpdated || 0}{' '}
              actualizados • Equipos: +{lastSyncSummary.equipmentsCreated || 0} nuevos /{' '}
              {lastSyncSummary.equipmentsUpdated || 0} actualizados ({lastSyncSummary.equipmentsOrphan || 0} sin cliente)
              • Problemas: +{lastSyncSummary.problemsCreated || 0} nuevos / {lastSyncSummary.problemsUpdated || 0}{' '}
              actualizados
            </Typography>
          )}
        </Paper>
      )}

      {problems.length > 0 && (
        <>
          <Divider />
          <Box>
            <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1.5 }}>
              Catálogo de Problemas Sincronizados ({problems.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {problems.slice(0, 18).map(p => (
                <CustomChip
                  key={p.id}
                  rounded
                  skin='light'
                  size='small'
                  color='secondary'
                  label={`${p.externalCode ? `[${p.externalCode}] ` : ''}${p.name}`}
                />
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}

export default TenantErpSyncTab
