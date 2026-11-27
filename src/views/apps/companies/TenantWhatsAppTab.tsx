// ** React Imports
import { useState, useEffect, useCallback, FormEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** API & Types
import api from 'src/configs/api'
import { AgentArea, TenantItem, WhatsAppAgentItem } from './types'

interface Props {
  tenant: TenantItem
  onRefresh: () => Promise<void>
}

const AREA_META: Record<AgentArea, { label: string; color: 'warning' | 'info' | 'secondary' }> = {
  TECHNICAL_SERVICE: { label: 'Servicio Técnico', color: 'warning' },
  ACCOUNTING: { label: 'Contadores', color: 'info' },
  GENERAL: { label: 'General', color: 'secondary' }
}

const TenantWhatsAppTab = ({ tenant, onRefresh }: Props) => {
  const [agents, setAgents] = useState<WhatsAppAgentItem[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [isLoadingAgents, setIsLoadingAgents] = useState(true)

  const [form, setForm] = useState({
    whatsappPhoneNumberId: tenant.whatsappPhoneNumberId || '',
    whatsappWabaId: tenant.whatsappWabaId || '',
    whatsappAccessToken: '',
    whatsappPhone: tenant.whatsappPhone || ''
  })
  const [hasExistingToken, setHasExistingToken] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [newAgentForm, setNewAgentForm] = useState<{
    name: string
    area: AgentArea
    whatsappPhone: string
  }>({
    name: '',
    area: 'ACCOUNTING',
    whatsappPhone: ''
  })
  const [isCreatingAgent, setIsCreatingAgent] = useState(false)

  const syncFormFromAgent = useCallback((agent: WhatsAppAgentItem) => {
    setForm({
      whatsappPhoneNumberId: agent.whatsappPhoneNumberId || '',
      whatsappWabaId: agent.whatsappWabaId || '',
      whatsappAccessToken: '',
      whatsappPhone: agent.whatsappPhone || ''
    })
    setHasExistingToken(Boolean(agent.hasWhatsAppToken))
  }, [])

  const loadAgents = useCallback(async () => {
    setIsLoadingAgents(true)
    try {
      const res = await api.get(`/agents?tenantId=${tenant.id}`)
      const list: WhatsAppAgentItem[] = Array.isArray(res.data) ? res.data : []
      setAgents(list)

      if (list.length > 0) {
        const chosen = list.find(a => a.id === selectedAgentId) || list[0]
        setSelectedAgentId(chosen.id)
        syncFormFromAgent(chosen)
      }
    } catch {
      toast.error('No se pudieron cargar los agentes y líneas de WhatsApp')
    } finally {
      setIsLoadingAgents(false)
    }
  }, [tenant.id, selectedAgentId, syncFormFromAgent])

  useEffect(() => {
    loadAgents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant.id])

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || null

  const handleSelectAgent = (agent: WhatsAppAgentItem) => {
    setSelectedAgentId(agent.id)
    syncFormFromAgent(agent)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAgent) return
    setIsSaving(true)
    try {
      const payload: Record<string, string> = {
        whatsappPhoneNumberId: form.whatsappPhoneNumberId,
        whatsappWabaId: form.whatsappWabaId,
        whatsappPhone: form.whatsappPhone
      }
      if (form.whatsappAccessToken.trim()) {
        payload.whatsappAccessToken = form.whatsappAccessToken.trim()
      }

      await api.patch(`/agents/${selectedAgent.id}/whatsapp-config?tenantId=${tenant.id}`, payload)
      toast.success(`Línea WhatsApp actualizada para ${selectedAgent.name}`)
      await loadAgents()
      await onRefresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al guardar configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateAgent = async (e: FormEvent) => {
    e.preventDefault()
    if (!newAgentForm.name.trim()) return
    setIsCreatingAgent(true)
    try {
      const res = await api.post(`/agents?tenantId=${tenant.id}`, newAgentForm)
      toast.success(`Agente '${res.data.name}' creado`)
      setOpenCreateDialog(false)
      setNewAgentForm({ name: '', area: 'ACCOUNTING', whatsappPhone: '' })
      setSelectedAgentId(res.data.id)
      await loadAgents()
      await onRefresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'No se pudo crear el agente')
    } finally {
      setIsCreatingAgent(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
            Agentes y Teléfonos de WhatsApp ({tenant.name})
          </Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            Configura una línea de Meta Cloud API independiente por cada área o agente
          </Typography>
        </Box>
        <Button
          size='small'
          variant='contained'
          startIcon={<Icon icon='tabler:plus' />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Nuevo Agente / Teléfono
        </Button>
      </Box>

      {isLoadingAgents ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={26} />
        </Box>
      ) : (
        <Stack direction='row' spacing={2} flexWrap='wrap' useFlexGap>
          {agents.map(agent => {
            const isSelected = agent.id === selectedAgent?.id
            const areaMeta = AREA_META[agent.area] || AREA_META.GENERAL
            const isConnected = agent.whatsappStatus === 'CONNECTED'

            return (
              <Paper
                key={agent.id}
                variant='outlined'
                onClick={() => handleSelectAgent(agent)}
                sx={{
                  p: 2.5,
                  minWidth: 230,
                  cursor: 'pointer',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  borderWidth: isSelected ? 2 : 1,
                  bgcolor: isSelected ? 'action.hover' : 'background.paper'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant='body2' sx={{ fontWeight: 700 }}>
                    {agent.name}
                  </Typography>
                  <CustomChip rounded skin='light' size='small' color={areaMeta.color} label={areaMeta.label} />
                </Box>
                <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>
                  {agent.whatsappPhone || 'Sin número visible'}
                </Typography>
                <CustomChip
                  rounded
                  skin='light'
                  size='small'
                  color={isConnected ? 'success' : 'secondary'}
                  label={isConnected ? 'Meta API Conectada' : 'Pendiente Meta API'}
                />
              </Paper>
            )
          })}
        </Stack>
      )}

      {selectedAgent && (
        <Box component='form' onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Alert severity='info'>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              Credenciales Meta Cloud API para: {selectedAgent.name}
            </Typography>
            <Typography variant='caption'>
              Los mensajes entrantes hacia este Phone Number ID se enrutarán automáticamente a este agente y su IA.
            </Typography>
          </Alert>

          <CustomTextField
            fullWidth
            label='WhatsApp Phone Number ID'
            placeholder='Ej: 102938475610293'
            value={form.whatsappPhoneNumberId}
            onChange={e => setForm({ ...form, whatsappPhoneNumberId: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='tabler:key' fontSize='1.125rem' />
                </InputAdornment>
              )
            }}
          />

          <CustomTextField
            fullWidth
            label='WhatsApp Business Account ID (WABA ID)'
            placeholder='Ej: 987654321098765'
            value={form.whatsappWabaId}
            onChange={e => setForm({ ...form, whatsappWabaId: e.target.value })}
          />

          <CustomTextField
            fullWidth
            label='System User Permanent Access Token'
            type={showToken ? 'text' : 'password'}
            placeholder={hasExistingToken ? 'Token guardado (escribe uno nuevo solo para reemplazarlo)' : 'EAA...'}
            value={form.whatsappAccessToken}
            onChange={e => setForm({ ...form, whatsappAccessToken: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={() => setShowToken(!showToken)} edge='end'>
                    <Icon icon={showToken ? 'tabler:eye-off' : 'tabler:eye'} fontSize='1.125rem' />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <CustomTextField
            fullWidth
            label='Número Telefónico Visible'
            placeholder='Ej: +54 9 11 5555-0199'
            value={form.whatsappPhone}
            onChange={e => setForm({ ...form, whatsappPhone: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='tabler:phone' fontSize='1.125rem' />
                </InputAdornment>
              )
            }}
          />

          <Paper variant='outlined' sx={{ p: 3 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1 }}>
              Datos para Webhook en Meta Developers (compartido para todas las líneas):
            </Typography>
            <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
              <strong>Callback URL:</strong>{' '}
              <code>{typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook` : '/api/whatsapp/webhook'}</code>
            </Typography>
            <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
              <strong>Verify Token:</strong> <code>meta_webhook_verify_token_whatsapp_crm</code>
            </Typography>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='submit' variant='contained' color='success' disabled={isSaving}>
              {isSaving ? <CircularProgress size={20} color='inherit' /> : `Guardar Línea (${selectedAgent.name})`}
            </Button>
          </Box>
        </Box>
      )}

      <Dialog open={openCreateDialog} onClose={() => !isCreatingAgent && setOpenCreateDialog(false)} maxWidth='xs' fullWidth>
        <form onSubmit={handleCreateAgent}>
          <DialogTitle>Nuevo Agente / Línea WhatsApp</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
            <CustomTextField
              fullWidth
              required
              label='Nombre del Agente'
              placeholder='Ej: Agente Contadores'
              value={newAgentForm.name}
              onChange={e => setNewAgentForm({ ...newAgentForm, name: e.target.value })}
            />
            <CustomTextField
              select
              fullWidth
              label='Área / Módulo'
              value={newAgentForm.area}
              onChange={e => setNewAgentForm({ ...newAgentForm, area: e.target.value as AgentArea })}
            >
              <MenuItem value='ACCOUNTING'>Contadores</MenuItem>
              <MenuItem value='TECHNICAL_SERVICE'>Servicio Técnico</MenuItem>
              <MenuItem value='GENERAL'>General / Administración</MenuItem>
            </CustomTextField>
            <CustomTextField
              fullWidth
              label='Número Visible (opcional)'
              placeholder='+54 9 11 ...'
              value={newAgentForm.whatsappPhone}
              onChange={e => setNewAgentForm({ ...newAgentForm, whatsappPhone: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 4 }}>
            <Button onClick={() => setOpenCreateDialog(false)} color='secondary' variant='tonal'>
              Cancelar
            </Button>
            <Button type='submit' variant='contained' disabled={isCreatingAgent}>
              {isCreatingAgent ? 'Creando...' : 'Crear Agente'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default TenantWhatsAppTab
