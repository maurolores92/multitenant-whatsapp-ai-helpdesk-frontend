// ** React Imports
import { useState, FormEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Tooltip from '@mui/material/Tooltip'
import TableRow from '@mui/material/TableRow'
import MenuItem from '@mui/material/MenuItem'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TableContainer from '@mui/material/TableContainer'
import CircularProgress from '@mui/material/CircularProgress'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** API & Types
import api from 'src/configs/api'
import { TenantItem, TenantUser } from './types'

interface Props {
  tenant: TenantItem
  onRefresh: () => Promise<void>
}

const TenantUsersTab = ({ tenant, onRefresh }: Props) => {
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'ADMIN' })
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false)

  const [editingUser, setEditingUser] = useState<TenantUser | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', role: 'ADMIN' })
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmittingAdd(true)
    try {
      await api.post(`/tenants/${tenant.id}/users`, userForm)
      toast.success(`Usuario '${userForm.name}' creado exitosamente`)
      setOpenAddDialog(false)
      setUserForm({ name: '', email: '', password: '', role: 'ADMIN' })
      await onRefresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear usuario')
    } finally {
      setIsSubmittingAdd(false)
    }
  }

  const handleUpdateUser = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setIsSubmittingEdit(true)
    try {
      const body: any = { name: editForm.name, email: editForm.email, role: editForm.role }
      if (editForm.password.trim().length >= 6) {
        body.password = editForm.password.trim()
      }
      const res = await api.patch(`/tenants/${tenant.id}/users/${editingUser.id}`, body)
      toast.success(`Usuario '${res.data.name}' actualizado`)
      setEditingUser(null)
      await onRefresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al actualizar usuario')
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const handleToggleStatus = async (user: TenantUser) => {
    setTogglingId(user.id)
    try {
      const res = await api.patch(`/tenants/${tenant.id}/users/${user.id}/toggle-status`)
      toast.success(`Usuario '${user.name}' ${res.data.isActive ? 'activado' : 'inactivado'}`)
      await onRefresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al cambiar estado')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
          Usuarios de la Empresa
        </Typography>
        <Button
          variant='contained'
          color='success'
          size='small'
          startIcon={<Icon icon='tabler:user-plus' />}
          onClick={() => setOpenAddDialog(true)}
        >
          Crear Usuario
        </Button>
      </Box>

      <TableContainer component={Paper} variant='outlined'>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align='right'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenant.users && tenant.users.length > 0 ? (
              tenant.users.map(u => (
                <TableRow key={u.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <CustomChip
                      rounded
                      skin='light'
                      size='small'
                      label={u.role}
                      color={u.role === 'ADMIN' ? 'primary' : u.role === 'TECHNICIAN' ? 'warning' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    <CustomChip
                      rounded
                      skin='light'
                      size='small'
                      label={u.isActive ? 'Activo' : 'Inactivo'}
                      color={u.isActive ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align='right'>
                    <Tooltip title='Editar Usuario'>
                      <IconButton
                        size='small'
                        color='info'
                        onClick={() => {
                          setEditingUser(u)
                          setEditForm({ name: u.name, email: u.email, password: '', role: u.role })
                        }}
                      >
                        <Icon icon='tabler:edit' fontSize='1.125rem' />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={u.isActive ? 'Inactivar' : 'Activar'}>
                      <IconButton
                        size='small'
                        color={u.isActive ? 'error' : 'success'}
                        disabled={togglingId === u.id}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {togglingId === u.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Icon icon={u.isActive ? 'tabler:ban' : 'tabler:check'} fontSize='1.125rem' />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                  No hay usuarios registrados en esta compañía.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal: Agregar Usuario */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth='xs' fullWidth>
        <form onSubmit={handleCreateUser}>
          <DialogTitle>Nuevo Usuario para {tenant.name}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
            <CustomTextField
              fullWidth
              required
              label='Nombre y Apellido'
              value={userForm.name}
              onChange={e => setUserForm({ ...userForm, name: e.target.value })}
            />
            <CustomTextField
              fullWidth
              required
              type='email'
              label='Correo Electrónico'
              value={userForm.email}
              onChange={e => setUserForm({ ...userForm, email: e.target.value })}
            />
            <CustomTextField
              fullWidth
              required
              type='password'
              label='Contraseña Inicial'
              value={userForm.password}
              onChange={e => setUserForm({ ...userForm, password: e.target.value })}
            />
            <CustomTextField
              select
              fullWidth
              label='Rol'
              value={userForm.role}
              onChange={e => setUserForm({ ...userForm, role: e.target.value })}
            >
              <MenuItem value='ADMIN'>Administrador de Empresa</MenuItem>
              <MenuItem value='TECHNICIAN'>Técnico Especialista</MenuItem>
              <MenuItem value='AGENT'>Agente de Atención WhatsApp</MenuItem>
            </CustomTextField>
          </DialogContent>
          <DialogActions sx={{ p: 4 }}>
            <Button onClick={() => setOpenAddDialog(false)} color='secondary' variant='tonal'>
              Cancelar
            </Button>
            <Button type='submit' variant='contained' color='success' disabled={isSubmittingAdd}>
              {isSubmittingAdd ? <CircularProgress size={20} color='inherit' /> : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal: Editar Usuario */}
      <Dialog open={Boolean(editingUser)} onClose={() => setEditingUser(null)} maxWidth='xs' fullWidth>
        <form onSubmit={handleUpdateUser}>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
            <CustomTextField
              fullWidth
              required
              label='Nombre y Apellido'
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
            />
            <CustomTextField
              fullWidth
              required
              type='email'
              label='Correo Electrónico'
              value={editForm.email}
              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
            />
            <CustomTextField
              fullWidth
              type='password'
              label='Nueva Contraseña (Opcional)'
              value={editForm.password}
              onChange={e => setEditForm({ ...editForm, password: e.target.value })}
              helperText='Mínimo 6 caracteres si deseas cambiarla'
            />
            <CustomTextField
              select
              fullWidth
              label='Rol'
              value={editForm.role}
              onChange={e => setEditForm({ ...editForm, role: e.target.value })}
            >
              <MenuItem value='ADMIN'>ADMIN (Administrador)</MenuItem>
              <MenuItem value='TECHNICIAN'>TECHNICIAN (Técnico)</MenuItem>
              <MenuItem value='AGENT'>AGENT (Agente WhatsApp)</MenuItem>
            </CustomTextField>
          </DialogContent>
          <DialogActions sx={{ p: 4 }}>
            <Button onClick={() => setEditingUser(null)} color='secondary' variant='tonal'>
              Cancelar
            </Button>
            <Button type='submit' variant='contained' disabled={isSubmittingEdit}>
              {isSubmittingEdit ? <CircularProgress size={20} color='inherit' /> : 'Guardar Cambios'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default TenantUsersTab
