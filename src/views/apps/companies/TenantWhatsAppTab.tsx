// ** React Imports
import { useState, useEffect, FormEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** API & Types
import api from 'src/configs/api'
import { TenantItem } from './types'

interface Props {
  tenant: TenantItem
  onRefresh: () => Promise<void>
}

const TenantWhatsAppTab = ({ tenant, onRefresh }: Props) => {
  const [form, setForm] = useState({
    whatsappPhoneNumberId: tenant.whatsappPhoneNumberId || '',
    whatsappWabaId: tenant.whatsappWabaId || '',
    whatsappAccessToken: tenant.whatsappAccessToken || '',
    whatsappPhone: tenant.whatsappPhone || ''
  })
  const [showToken, setShowToken] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setForm({
      whatsappPhoneNumberId: tenant.whatsappPhoneNumberId || '',
      whatsappWabaId: tenant.whatsappWabaId || '',
      whatsappAccessToken: tenant.whatsappAccessToken || '',
      whatsappPhone: tenant.whatsappPhone || ''
    })
  }, [tenant])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await api.patch(`/tenants/${tenant.id}/whatsapp-config`, form)
      toast.success(`Configuración de WhatsApp actualizada para ${tenant.name}`)
      await onRefresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al guardar configuración')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity='info'>
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          Requisitos oficiales de Meta WhatsApp Business Cloud API (Graph API v21.0)
        </Typography>
        <Typography variant='caption'>
          Obtén estos parámetros desde Meta for Developers para enviar y recibir mensajes por la línea oficial.
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
        placeholder='EAA...'
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
          Datos para Webhook en Meta Developers:
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
          {isSaving ? <CircularProgress size={20} color='inherit' /> : 'Guardar Configuración de WhatsApp'}
        </Button>
      </Box>
    </Box>
  )
}

export default TenantWhatsAppTab
