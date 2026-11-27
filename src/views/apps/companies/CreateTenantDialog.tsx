// ** React Imports
import { useState, FormEvent } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** API
import api from 'src/configs/api'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const CreateTenantDialog = ({ open, onClose, onSuccess }: Props) => {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    whatsappPhone: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/tenants', form)
      toast.success(`Compañía '${form.name}' creada exitosamente`)
      setForm({ name: '', slug: '', whatsappPhone: '', adminName: '', adminEmail: '', adminPassword: '' })
      onClose()
      onSuccess()
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al crear compañía'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Nueva Compañía y Usuario Administrador</span>
          <IconButton size='small' onClick={onClose}>
            <Icon icon='tabler:x' />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Registra una nueva empresa en la plataforma y genera su credencial de Administrador principal.
          </Typography>

          <CustomTextField
            fullWidth
            required
            label='Nombre de la Compañía'
            placeholder='Ej: Metalúrgica San Jorge S.A.'
            value={form.name}
            onChange={e => {
              const name = e.target.value
              const autoSlug = name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
              setForm(prev => ({ ...prev, name, slug: autoSlug }))
            }}
          />

          <CustomTextField
            fullWidth
            required
            label='Identificador único (Slug)'
            placeholder='ej: metalurgica-san-jorge'
            value={form.slug}
            onChange={e => setForm({ ...form, slug: e.target.value })}
            helperText='Identificador interno para base de datos'
          />

          <CustomTextField
            fullWidth
            label='Teléfono WhatsApp (Opcional)'
            placeholder='+54 9 11 5555-0199'
            value={form.whatsappPhone}
            onChange={e => setForm({ ...form, whatsappPhone: e.target.value })}
          />

          <Typography variant='subtitle2' sx={{ fontWeight: 700, mt: 1 }}>
            Credenciales del Administrador de la Empresa:
          </Typography>

          <CustomTextField
            fullWidth
            required
            label='Nombre del Administrador'
            placeholder='Ej: Roberto Pérez'
            value={form.adminName}
            onChange={e => setForm({ ...form, adminName: e.target.value })}
          />

          <CustomTextField
            fullWidth
            required
            type='email'
            label='Correo Electrónico'
            placeholder='roberto@sanjorge.com'
            value={form.adminEmail}
            onChange={e => setForm({ ...form, adminEmail: e.target.value })}
          />

          <CustomTextField
            fullWidth
            required
            type='password'
            label='Contraseña Inicial'
            placeholder='Mínimo 6 caracteres'
            value={form.adminPassword}
            onChange={e => setForm({ ...form, adminPassword: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button onClick={onClose} color='secondary' variant='tonal'>
            Cancelar
          </Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={20} color='inherit' /> : 'Crear Compañía'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateTenantDialog
