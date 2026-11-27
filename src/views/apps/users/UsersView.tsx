// ** React Imports
import { useState, useEffect, useMemo, FormEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'
import { getInitials } from 'src/@core/utils/get-initials'

// ** API, Hooks & Subcomponents
import api from 'src/configs/api'
import { useAuth } from 'src/hooks/useAuth'
import { UserItem } from './types'
import AddUserDrawer from './AddUserDrawer'
import { EditUserDialog, ChangePasswordDialog, QuickRoleDialog } from './UserModals'

const roleMeta: Record<string, { label: string; color: 'primary' | 'warning' | 'info' | 'error'; icon: string }> = {
  SUPER_ADMIN: { label: 'Superadmin', color: 'error', icon: 'tabler:shield-lock' },
  ADMIN: { label: 'Administrador', color: 'primary', icon: 'tabler:shield-check' },
  TECHNICIAN: { label: 'Técnico Especialista', color: 'warning', icon: 'tabler:tool' },
  AGENT: { label: 'Operador Soporte', color: 'info', icon: 'tabler:headset' }
}

const UsersView = () => {
  const { user: sessionUser } = useAuth()
  const [users, setUsers] = useState<UserItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'TECHNICIAN' | 'AGENT'>('ALL')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const [addDrawerOpen, setAddDrawerOpen] = useState(false)

  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'TECHNICIAN' as 'ADMIN' | 'TECHNICIAN' | 'AGENT',
    isActive: true
  })
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)

  const [passwordModalUser, setPasswordModalUser] = useState<UserItem | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)

  const [quickRoleUser, setQuickRoleUser] = useState<UserItem | null>(null)
  const [quickSelectedRole, setQuickSelectedRole] = useState<'ADMIN' | 'TECHNICIAN' | 'AGENT'>('TECHNICIAN')
  const [isSubmittingQuickRole, setIsSubmittingQuickRole] = useState(false)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/users')
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch {
      toast.error('Error al cargar el listado de usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  const handleToggleStatus = async (user: UserItem) => {
    try {
      const res = await api.patch(`/users/${user.id}/toggle-status`)
      toast.success(`Usuario ${user.name} ${res.data.isActive ? 'activado' : 'inactivado'}`)
      fetchUsers()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'No se pudo cambiar el estado')
    }
  }

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setIsSubmittingEdit(true)
    try {
      await api.patch(`/users/${editingUser.id}`, editForm)
      toast.success(`Usuario ${editForm.name} actualizado`)
      setEditingUser(null)
      fetchUsers()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al actualizar usuario')
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!passwordModalUser) return
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')

      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')

      return
    }
    setIsSubmittingPassword(true)
    try {
      await api.patch(`/users/${passwordModalUser.id}/password`, { newPassword })
      toast.success(`Contraseña actualizada para ${passwordModalUser.name}`)
      setPasswordModalUser(null)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'No se pudo actualizar la contraseña')
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  const handleSaveQuickRole = async () => {
    if (!quickRoleUser) return
    setIsSubmittingQuickRole(true)
    try {
      await api.patch(`/users/${quickRoleUser.id}`, { role: quickSelectedRole })
      toast.success(`Rol de ${quickRoleUser.name} actualizado`)
      setQuickRoleUser(null)
      fetchUsers()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'No se pudo cambiar el rol')
    } finally {
      setIsSubmittingQuickRole(false)
    }
  }

  const columns: GridColDef[] = [
    {
      flex: 0.28,
      minWidth: 250,
      field: 'name',
      headerName: 'Usuario',
      renderCell: ({ row }: { row: UserItem }) => {
        const meta = roleMeta[row.role] || roleMeta.AGENT
        const isMe = sessionUser?.id === row.id

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <CustomAvatar skin='light' color={meta.color} sx={{ width: 36, height: 36, fontWeight: 600 }}>
              {getInitials(row.name)}
            </CustomAvatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography noWrap variant='body2' sx={{ fontWeight: 600 }}>
                {row.name} {isMe && <Typography component='span' variant='caption' color='primary.main'>(Tú)</Typography>}
              </Typography>
              <Typography noWrap variant='caption' sx={{ color: 'text.secondary' }}>
                {row.email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 180,
      field: 'role',
      headerName: 'Rol',
      renderCell: ({ row }: { row: UserItem }) => {
        const meta = roleMeta[row.role] || roleMeta.AGENT

        return (
          <Tooltip title='Clic para cambiar rol'>
            <CustomChip
              rounded
              skin='light'
              size='small'
              color={meta.color}
              icon={<Icon icon={meta.icon} fontSize='0.95rem' />}
              label={meta.label}
              onClick={() => {
                setQuickRoleUser(row)
                setQuickSelectedRole((row.role === 'SUPER_ADMIN' ? 'ADMIN' : row.role) as any)
              }}
              sx={{ cursor: 'pointer' }}
            />
          </Tooltip>
        )
      }
    },
    {
      flex: 0.14,
      minWidth: 110,
      field: 'isActive',
      headerName: 'Estado',
      renderCell: ({ row }: { row: UserItem }) => (
        <CustomChip
          rounded
          skin='light'
          size='small'
          label={row.isActive ? 'Activo' : 'Inactivo'}
          color={row.isActive ? 'success' : 'secondary'}
        />
      )
    },
    {
      flex: 0.16,
      minWidth: 130,
      field: 'createdAt',
      headerName: 'Fecha Alta',
      renderCell: ({ row }: { row: UserItem }) => (
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {new Date(row.createdAt).toLocaleDateString('es-AR')}
        </Typography>
      )
    },
    {
      flex: 0.18,
      minWidth: 160,
      sortable: false,
      field: 'actions',
      headerName: 'Acciones',
      renderCell: ({ row }: { row: UserItem }) => {
        const isMe = sessionUser?.id === row.id

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title='Cambiar Contraseña'>
              <IconButton
                size='small'
                color='info'
                onClick={() => {
                  setPasswordModalUser(row)
                  setNewPassword('')
                  setConfirmPassword('')
                }}
              >
                <Icon icon='tabler:key' fontSize='1.125rem' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Editar Usuario'>
              <IconButton
                size='small'
                color='primary'
                onClick={() => {
                  setEditingUser(row)
                  setEditForm({
                    name: row.name,
                    email: row.email,
                    role: (row.role === 'SUPER_ADMIN' ? 'ADMIN' : row.role) as any,
                    isActive: row.isActive
                  })
                }}
              >
                <Icon icon='tabler:edit' fontSize='1.125rem' />
              </IconButton>
            </Tooltip>
            <Tooltip title={isMe ? 'No puedes inactivar tu cuenta' : row.isActive ? 'Inactivar' : 'Activar'}>
              <span>
                <Switch
                  size='small'
                  color='success'
                  checked={row.isActive}
                  disabled={isMe}
                  onChange={() => handleToggleStatus(row)}
                />
              </span>
            </Tooltip>
          </Box>
        )
      }
    }
  ]

  const activeCount = users.filter(u => u.isActive).length
  const techCount = users.filter(u => u.role === 'TECHNICIAN').length
  const adminCount = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(users.length)}
          trend='positive'
          trendDiff='+100'
          title='Total Usuarios'
          subtitle='Miembros registrados'
          avatarColor='primary'
          icon='tabler:users'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(activeCount)}
          trend='positive'
          trendDiff='Activos'
          title='Cuentas Activas'
          subtitle='Con acceso habilitado'
          avatarColor='success'
          icon='tabler:user-check'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(techCount)}
          trend='positive'
          trendDiff='Campo'
          title='Técnicos'
          subtitle='Especialistas en servicio'
          avatarColor='warning'
          icon='tabler:tool'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatsHorizontalWithDetails
          stats={String(adminCount)}
          trend='positive'
          trendDiff='Gestión'
          title='Administradores'
          subtitle='Control de plataforma'
          avatarColor='info'
          icon='tabler:shield-check'
        />
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Gestión de Usuarios del Equipo'
            subheader='Administra técnicos, operadores y administradores, asigna roles y gestiona contraseñas'
            action={
              <Button
                variant='contained'
                startIcon={<Icon icon='tabler:plus' />}
                onClick={() => setAddDrawerOpen(true)}
              >
                Nuevo Usuario
              </Button>
            }
          />
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={8}>
                <CustomTextField
                  fullWidth
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='Buscar por nombre o correo electrónico...'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Icon icon='tabler:search' fontSize='1.125rem' />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  select
                  fullWidth
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value as any)}
                >
                  <MenuItem value='ALL'>Todos los Roles</MenuItem>
                  <MenuItem value='ADMIN'>Administradores</MenuItem>
                  <MenuItem value='TECHNICIAN'>Técnicos</MenuItem>
                  <MenuItem value='AGENT'>Operadores de Soporte</MenuItem>
                </CustomTextField>
              </Grid>
            </Grid>
          </CardContent>
          <Divider sx={{ m: '0 !important' }} />
          <DataGrid
            autoHeight
            rowHeight={62}
            loading={isLoading}
            rows={filteredUsers}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
          />
        </Card>
      </Grid>

      <AddUserDrawer open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)} onSuccess={fetchUsers} />

      <EditUserDialog
        user={editingUser}
        currentUserId={sessionUser?.id}
        form={editForm}
        isSubmitting={isSubmittingEdit}
        onClose={() => setEditingUser(null)}
        onChangeForm={setEditForm}
        onSubmit={handleEditSubmit}
      />

      <ChangePasswordDialog
        user={passwordModalUser}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        showPassword={showNewPassword}
        isSubmitting={isSubmittingPassword}
        onClose={() => setPasswordModalUser(null)}
        onChangeNewPassword={setNewPassword}
        onChangeConfirmPassword={setConfirmPassword}
        onToggleShowPassword={() => setShowNewPassword(!showNewPassword)}
        onSubmit={handlePasswordSubmit}
      />

      <QuickRoleDialog
        user={quickRoleUser}
        selectedRole={quickSelectedRole}
        isSubmitting={isSubmittingQuickRole}
        onClose={() => setQuickRoleUser(null)}
        onChangeRole={setQuickSelectedRole}
        onSave={handleSaveQuickRole}
      />
    </Grid>
  )
}

export default UsersView
