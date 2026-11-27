// ** React Imports
import { FormEvent } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Types & Subcomponents
import { ROLE_DEFAULT_PERMISSIONS } from 'src/configs/permissions'
import { UserItem } from './types'
import UserPermissionsSelector from './UserPermissionsSelector'

interface EditUserDialogProps {
  user: UserItem | null
  currentUserId?: string
  form: { name: string; email: string; role: UserItem['role']; isActive: boolean; permissions: string[] }
  isSubmitting: boolean
  onClose: () => void
  onChangeForm: (form: any) => void
  onSubmit: (e: FormEvent) => void
}

export const EditUserDialog = ({
  user,
  currentUserId,
  form,
  isSubmitting,
  onClose,
  onChangeForm,
  onSubmit
}: EditUserDialogProps) => (
  <Dialog open={Boolean(user)} onClose={() => !isSubmitting && onClose()} maxWidth='sm' fullWidth>
    {user && (
      <form onSubmit={onSubmit}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Editar Usuario y Permisos</span>
          <IconButton size='small' onClick={onClose}>
            <Icon icon='tabler:x' />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
          <CustomTextField
            fullWidth
            required
            label='Nombre Completo'
            value={form.name}
            onChange={e => onChangeForm({ ...form, name: e.target.value })}
          />
          <CustomTextField
            fullWidth
            required
            type='email'
            label='Correo Electrónico'
            value={form.email}
            onChange={e => onChangeForm({ ...form, email: e.target.value })}
          />
          {user.role !== 'SUPER_ADMIN' && (
            <>
              <CustomTextField
                select
                fullWidth
                required
                label='Rol Base en la Empresa'
                value={form.role}
                onChange={e => {
                  const nextRole = e.target.value as 'ADMIN' | 'TECHNICIAN' | 'AGENT'
                  onChangeForm({
                    ...form,
                    role: nextRole,
                    permissions: [...ROLE_DEFAULT_PERMISSIONS[nextRole]]
                  })
                }}
              >
                <MenuItem value='ADMIN'>Administrador</MenuItem>
                <MenuItem value='TECHNICIAN'>Técnico Especialista</MenuItem>
                <MenuItem value='AGENT'>Operador Soporte</MenuItem>
              </CustomTextField>

              <UserPermissionsSelector
                permissions={form.permissions}
                onChange={permissions => onChangeForm({ ...form, permissions })}
                disabled={isSubmitting}
              />
            </>
          )}
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                disabled={currentUserId === user.id}
                onChange={e => onChangeForm({ ...form, isActive: e.target.checked })}
                color='success'
              />
            }
            label={form.isActive ? 'Usuario Activo' : 'Usuario Inactivo'}
          />
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button onClick={onClose} color='secondary' variant='tonal'>
            Cancelar
          </Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </form>
    )}
  </Dialog>
)

interface PasswordDialogProps {
  user: UserItem | null
  newPassword: string
  confirmPassword: string
  showPassword: boolean
  isSubmitting: boolean
  onClose: () => void
  onChangeNewPassword: (val: string) => void
  onChangeConfirmPassword: (val: string) => void
  onToggleShowPassword: () => void
  onSubmit: (e: FormEvent) => void
}

export const ChangePasswordDialog = ({
  user,
  newPassword,
  confirmPassword,
  showPassword,
  isSubmitting,
  onClose,
  onChangeNewPassword,
  onChangeConfirmPassword,
  onToggleShowPassword,
  onSubmit
}: PasswordDialogProps) => (
  <Dialog open={Boolean(user)} onClose={() => !isSubmitting && onClose()} maxWidth='xs' fullWidth>
    {user && (
      <form onSubmit={onSubmit}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Cambiar Contraseña</span>
          <IconButton size='small' onClick={onClose}>
            <Icon icon='tabler:x' />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Nueva clave para <strong>{user.name}</strong> ({user.email}).
          </Typography>
          <CustomTextField
            fullWidth
            required
            label='Nueva Contraseña'
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={e => onChangeNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={onToggleShowPassword} edge='end'>
                    <Icon icon={showPassword ? 'tabler:eye-off' : 'tabler:eye'} fontSize='1.125rem' />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <CustomTextField
            fullWidth
            required
            label='Confirmar Contraseña'
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => onChangeConfirmPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button onClick={onClose} color='secondary' variant='tonal'>
            Cancelar
          </Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
          </Button>
        </DialogActions>
      </form>
    )}
  </Dialog>
)

interface QuickRoleDialogProps {
  user: UserItem | null
  selectedRole: 'ADMIN' | 'TECHNICIAN' | 'AGENT'
  isSubmitting: boolean
  onClose: () => void
  onChangeRole: (role: 'ADMIN' | 'TECHNICIAN' | 'AGENT') => void
  onSave: () => void
}

export const QuickRoleDialog = ({
  user,
  selectedRole,
  isSubmitting,
  onClose,
  onChangeRole,
  onSave
}: QuickRoleDialogProps) => (
  <Dialog open={Boolean(user)} onClose={() => !isSubmitting && onClose()} maxWidth='xs' fullWidth>
    {user && (
      <>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Cambiar Rol</span>
          <IconButton size='small' onClick={onClose}>
            <Icon icon='tabler:x' />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Selecciona el nuevo rol para <strong>{user.name}</strong>:
          </Typography>
          <CustomTextField
            select
            fullWidth
            label='Rol en la Empresa'
            value={selectedRole}
            onChange={e => onChangeRole(e.target.value as any)}
          >
            <MenuItem value='ADMIN'>Administrador</MenuItem>
            <MenuItem value='TECHNICIAN'>Técnico Especialista</MenuItem>
            <MenuItem value='AGENT'>Operador Soporte</MenuItem>
          </CustomTextField>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button onClick={onClose} color='secondary' variant='tonal'>
            Cancelar
          </Button>
          <Button onClick={onSave} variant='contained' disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Rol'}
          </Button>
        </DialogActions>
      </>
    )}
  </Dialog>
)
