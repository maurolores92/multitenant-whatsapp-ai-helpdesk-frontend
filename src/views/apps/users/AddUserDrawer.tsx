// ** React Imports
import { useState, FormEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import { styled } from '@mui/material/styles'

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

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const AddUserDrawer = ({ open, onClose, onSuccess }: Props) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TECHNICIAN' as 'ADMIN' | 'TECHNICIAN' | 'AGENT'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error('Por favor completa todos los campos requeridos')

      return
    }
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')

      return
    }

    setIsSubmitting(true)
    try {
      const res = await api.post('/users', form)
      toast.success(`Usuario ${res.data.name} creado exitosamente`)
      setForm({ name: '', email: '', password: '', role: 'TECHNICIAN' })
      onClose()
      onSuccess()
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'No se pudo crear el usuario'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={() => !isSubmitting && onClose()}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Header>
        <Typography variant='h5'>Nuevo Usuario</Typography>
        <IconButton
          size='small'
          onClick={() => !isSubmitting && onClose()}
          sx={{
            p: '0.438rem',
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected'
          }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>

      <Box component='form' onSubmit={handleSubmit} sx={{ p: theme => theme.spacing(0, 6, 6), display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          Ingresa los datos para habilitar el acceso de un nuevo miembro del equipo.
        </Typography>

        <CustomTextField
          fullWidth
          required
          label='Nombre Completo'
          placeholder='Ej. Juan Pérez'
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <CustomTextField
          fullWidth
          required
          type='email'
          label='Correo Electrónico'
          placeholder='juan@empresa.com'
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <CustomTextField
          select
          fullWidth
          required
          label='Rol en la Empresa'
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value as any })}
        >
          <MenuItem value='ADMIN'>Administrador (Acceso total)</MenuItem>
          <MenuItem value='TECHNICIAN'>Técnico Especialista (Órdenes y visitas)</MenuItem>
          <MenuItem value='AGENT'>Operador Soporte (WhatsApp Chat)</MenuItem>
        </CustomTextField>

        <CustomTextField
          fullWidth
          required
          label='Contraseña Inicial'
          type={showPassword ? 'text' : 'password'}
          placeholder='Mínimo 6 caracteres'
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton size='small' onClick={() => setShowPassword(!showPassword)} edge='end'>
                  <Icon icon={showPassword ? 'tabler:eye-off' : 'tabler:eye'} fontSize='1.125rem' />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 2 }}>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear Usuario'}
          </Button>
          <Button variant='tonal' color='secondary' onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default AddUserDrawer
