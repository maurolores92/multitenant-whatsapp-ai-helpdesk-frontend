'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  Avatar,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  VpnKey as VpnKeyIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Engineering as TechIcon,
  SupportAgent as AgentIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TECHNICIAN' | 'AGENT';
  isActive: boolean;
  createdAt: string;
  tenantId?: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function UsersView() {
  const router = useRouter();

  // Estados de datos
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSessionUser, setCurrentSessionUser] = useState<any>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'TECHNICIAN' | 'AGENT'>('ALL');

  // Modal: Crear Usuario
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TECHNICIAN' as 'ADMIN' | 'TECHNICIAN' | 'AGENT',
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Modal: Editar Usuario
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'TECHNICIAN' as UserItem['role'],
    isActive: true,
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Modal: Cambiar Contraseña
  const [passwordModalUser, setPasswordModalUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Modal: Cambio Rápido de Rol
  const [quickRoleModalUser, setQuickRoleModalUser] = useState<UserItem | null>(null);
  const [quickSelectedRole, setQuickSelectedRole] = useState<'ADMIN' | 'TECHNICIAN' | 'AGENT'>('TECHNICIAN');
  const [isSubmittingQuickRole, setIsSubmittingQuickRole] = useState(false);

  // Notificaciones Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Cargar sesión y lista de usuarios
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      if (!token) return;

      const res = await fetch(`${apiUrl}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          showNotification('Acceso denegado: solo administradores pueden ver esta sección.', 'error');
          router.push('/dashboard');
          return;
        }
        throw new Error('Error al consultar usuarios');
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showNotification('Error al conectar con el servidor para cargar usuarios', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          setCurrentSessionUser(parsed);
          if (parsed.role !== 'ADMIN' && parsed.role !== 'SUPER_ADMIN') {
            router.push('/dashboard');
            return;
          }
        } catch {
          router.push('/login');
          return;
        }
      } else {
        router.push('/login');
        return;
      }
    }

    fetchUsers();
  }, [router]);

  // Filtrado de usuarios
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Manejador: Crear Usuario
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }
    if (createForm.password.length < 6) {
      showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const res = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al crear usuario');
      }

      showNotification(`✔ Usuario ${data.name} creado exitosamente`);
      setCreateModalOpen(false);
      setCreateForm({ name: '', email: '', password: '', role: 'TECHNICIAN' });
      fetchUsers();
    } catch (err: any) {
      showNotification(err.message || 'No se pudo crear el usuario', 'error');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Manejador: Abrir Edición
  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  };

  // Manejador: Guardar Edición
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmittingEdit(true);
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const payload =
        editingUser.role === 'SUPER_ADMIN'
          ? {
              name: editForm.name,
              email: editForm.email,
            }
          : editForm;

      const res = await fetch(`${apiUrl}/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar usuario');
      }

      if (currentSessionUser?.id === editingUser.id) {
        const updatedSessionUser = {
          ...currentSessionUser,
          name: data.name ?? editForm.name,
          email: data.email ?? editForm.email,
        };
        localStorage.setItem('auth_user', JSON.stringify(updatedSessionUser));
        setCurrentSessionUser(updatedSessionUser);
      }

      showNotification(`✔ Usuario ${data.name} actualizado exitosamente`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      showNotification(err.message || 'No se pudo actualizar el usuario', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Manejador: Cambiar Contraseña
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;

    if (newPassword.length < 6) {
      showNotification('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const res = await fetch(`${apiUrl}/users/${passwordModalUser.id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar contraseña');
      }

      showNotification(`✔ Contraseña actualizada para ${passwordModalUser.name}`);
      setPasswordModalUser(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showNotification(err.message || 'No se pudo cambiar la contraseña', 'error');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Manejador: Cambio Rápido de Rol
  const handleOpenQuickRole = (user: UserItem) => {
    if (user.role === 'SUPER_ADMIN') return;
    setQuickRoleModalUser(user);
    setQuickSelectedRole(user.role);
  };

  const handleSaveQuickRole = async () => {
    if (!quickRoleModalUser) return;
    setIsSubmittingQuickRole(true);

    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const res = await fetch(`${apiUrl}/users/${quickRoleModalUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: quickSelectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al cambiar rol');
      }

      showNotification(`✔ Rol de ${quickRoleModalUser.name} actualizado a ${quickSelectedRole}`);
      setQuickRoleModalUser(null);
      fetchUsers();
    } catch (err: any) {
      showNotification(err.message || 'No se pudo actualizar el rol', 'error');
    } finally {
      setIsSubmittingQuickRole(false);
    }
  };

  // Manejador: Alternar Estado (Activar / Inactivar)
  const handleToggleStatus = async (user: UserItem) => {
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const res = await fetch(`${apiUrl}/users/${user.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al alternar estado');
      }

      const statusText = data.isActive ? 'activado' : 'inactivado';
      showNotification(`✔ Usuario ${user.name} ${statusText} correctamente`);
      fetchUsers();
    } catch (err: any) {
      showNotification(err.message || 'No se pudo alternar el estado del usuario', 'error');
    }
  };

  // Renderizador de Chip de Rol
  const renderRoleChip = (user: UserItem) => {
    let label = 'Agente';
    let color: 'primary' | 'secondary' | 'warning' | 'error' | 'default' = 'default';
    let icon = <AgentIcon sx={{ fontSize: '0.95rem !important' }} />;

    if (user.role === 'SUPER_ADMIN') {
      label = 'Superadmin';
      color = 'error';
      icon = <AdminIcon sx={{ fontSize: '0.95rem !important' }} />;
    } else if (user.role === 'ADMIN') {
      label = 'Administrador';
      color = 'primary';
      icon = <AdminIcon sx={{ fontSize: '0.95rem !important' }} />;
    } else if (user.role === 'TECHNICIAN') {
      label = 'Técnico Especialista';
      color = 'warning';
      icon = <TechIcon sx={{ fontSize: '0.95rem !important' }} />;
    } else if (user.role === 'AGENT') {
      label = 'Operador Soporte';
      color = 'secondary';
      icon = <AgentIcon sx={{ fontSize: '0.95rem !important' }} />;
    }

    const isSuperAdminRole = user.role === 'SUPER_ADMIN';

    return (
      <Tooltip
        title={isSuperAdminRole ? 'Rol global del sistema (no editable)' : 'Clic para cambiar rol de este usuario'}
        arrow
        placement="top"
      >
        <Chip
          icon={icon}
          label={label}
          color={color}
          size="small"
          onClick={isSuperAdminRole ? undefined : () => handleOpenQuickRole(user)}
          sx={{
            fontWeight: 700,
            fontSize: '0.75rem',
            cursor: isSuperAdminRole ? 'default' : 'pointer',
            height: 24,
            ...(isSuperAdminRole ? {} : { '&:hover': { opacity: 0.85, boxShadow: 1 } }),
          }}
        />
      </Tooltip>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Encabezado Principal */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PeopleIcon sx={{ color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                Gestión de Usuarios del Equipo
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Administra técnicos, operadores y administradores, asigna roles y gestiona contraseñas
              </Typography>
            </Box>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateModalOpen(true)}
          sx={{
            bgcolor: '#4f46e5',
            '&:hover': { bgcolor: '#4338ca' },
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 2,
            px: 2.5,
          }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {/* Contenedor Principal: Filtros y Tabla */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Barra de Búsqueda y Filtros */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <TextField
            size="small"
            placeholder="Buscar por nombre o correo electrónico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: { xs: '100%', sm: 320 } }}
          />

          <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              select
              size="small"
              label="Filtrar por Rol"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="ALL">Todos los Roles</MenuItem>
              {currentSessionUser?.role === 'SUPER_ADMIN' && (
                <MenuItem value="SUPER_ADMIN">Superadministradores</MenuItem>
              )}
              <MenuItem value="ADMIN">Administradores</MenuItem>
              <MenuItem value="TECHNICIAN">Técnicos</MenuItem>
              <MenuItem value="AGENT">Operadores de Soporte</MenuItem>
            </TextField>
          </Box>
        </Box>

        {/* Tabla de Usuarios (ERP Style) */}
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>
                  Usuario
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>
                  Correo Electrónico
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>
                  Rol en la Empresa
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>
                  Estado
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>
                  Fecha de Alta
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#4f46e5' }} />
                    <Typography variant="body2" sx={{ mt: 1.5, color: '#64748b' }}>
                      Cargando listado de usuarios...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#64748b' }}>
                    <PeopleIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      No se encontraron usuarios registrados con los criterios seleccionados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const initials = user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  const formattedDate = new Date(user.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  });

                  const isCurrentUser = currentSessionUser?.id === user.id;

                  return (
                    <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Usuario (Nombre + Avatar) */}
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor:
                                user.role === 'SUPER_ADMIN'
                                  ? '#dc2626'
                                  : user.role === 'ADMIN'
                                  ? '#4f46e5'
                                  : user.role === 'TECHNICIAN'
                                  ? '#d97706'
                                  : '#0284c7',
                              fontSize: '0.85rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {initials}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                              {user.name}
                            </Typography>
                            {isCurrentUser && (
                              <Typography variant="caption" sx={{ color: '#4f46e5', fontWeight: 'bold' }}>
                                (Tu cuenta activa)
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Correo Electrónico */}
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ color: '#334155' }}>
                          {user.email}
                        </Typography>
                      </TableCell>

                      {/* Rol en la Empresa */}
                      <TableCell sx={{ py: 2 }}>
                        {renderRoleChip(user)}
                      </TableCell>

                      {/* Estado (Activo / Inactivo) */}
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          size="small"
                          label={user.isActive ? 'Activo' : 'Inactivo'}
                          color={user.isActive ? 'success' : 'default'}
                          variant={user.isActive ? 'filled' : 'outlined'}
                          onClick={() => {
                            if (!isCurrentUser) handleToggleStatus(user);
                          }}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            cursor: isCurrentUser ? 'default' : 'pointer',
                          }}
                        />
                      </TableCell>

                      {/* Fecha de Alta */}
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {formattedDate}
                        </Typography>
                      </TableCell>

                      {/* Acciones */}
                      <TableCell align="right" sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {/* Cambiar Contraseña */}
                          <Tooltip title="Cambiar Contraseña" arrow>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setPasswordModalUser(user);
                                setNewPassword('');
                                setConfirmPassword('');
                              }}
                              sx={{
                                color: '#0284c7',
                                bgcolor: 'rgba(2, 132, 199, 0.08)',
                                '&:hover': { bgcolor: 'rgba(2, 132, 199, 0.16)' },
                              }}
                            >
                              <VpnKeyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* Editar Usuario */}
                          <Tooltip title="Editar Usuario y Rol" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(user)}
                              sx={{
                                color: '#4f46e5',
                                bgcolor: 'rgba(79, 70, 229, 0.08)',
                                '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.16)' },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* Switch Activar / Inactivar */}
                          <Tooltip
                            title={
                              isCurrentUser
                                ? 'No puedes inactivar tu propia cuenta'
                                : user.isActive
                                ? 'Inactivar acceso'
                                : 'Activar acceso'
                            }
                            arrow
                          >
                            <span>
                              <Switch
                                size="small"
                                checked={user.isActive}
                                disabled={isCurrentUser}
                                onChange={() => handleToggleStatus(user)}
                                color="success"
                              />
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ======================================================== */}
      {/* MODAL: CREAR NUEVO USUARIO                               */}
      {/* ======================================================== */}
      <Dialog
        open={createModalOpen}
        onClose={() => !isSubmittingCreate && setCreateModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Dar de Alta Nuevo Usuario</span>
            <IconButton size="small" onClick={() => setCreateModalOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Ingresa los datos para crear un nuevo usuario y habilitar su acceso a la plataforma.
            </Typography>

            <TextField
              label="Nombre Completo"
              placeholder="Ej. Juan Pérez"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Correo Electrónico"
              type="email"
              placeholder="juan@empresa.com"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
              fullWidth
            />

            <TextField
              select
              label="Rol en la Empresa"
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
              required
              fullWidth
            >
              <MenuItem value="ADMIN">🛡️ Administrador (Acceso total y gestión de usuarios)</MenuItem>
              <MenuItem value="TECHNICIAN">🔧 Técnico Especialista (Órdenes de servicio y visitas)</MenuItem>
              <MenuItem value="AGENT">💬 Operador Soporte (Atención chats y reclamos)</MenuItem>
            </TextField>

            <TextField
              label="Contraseña Inicial"
              type={showCreatePassword ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                        edge="end"
                      >
                        {showCreatePassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setCreateModalOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmittingCreate}
              sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, fontWeight: 'bold', textTransform: 'none' }}
            >
              {isSubmittingCreate ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: EDITAR USUARIO Y ROL                              */}
      {/* ======================================================== */}
      <Dialog
        open={Boolean(editingUser)}
        onClose={() => !isSubmittingEdit && setEditingUser(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        {editingUser && (
          <form onSubmit={handleEditSubmit}>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Editar Usuario</span>
              <IconButton size="small" onClick={() => setEditingUser(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField
                label="Nombre Completo"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                fullWidth
              />

              <TextField
                label="Correo Electrónico"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
                fullWidth
              />

              {editingUser.role !== 'SUPER_ADMIN' && (
                <TextField
                  select
                  label="Rol en la Empresa"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  required
                  fullWidth
                >
                  <MenuItem value="ADMIN">🛡️ Administrador (Acceso total)</MenuItem>
                  <MenuItem value="TECHNICIAN">🔧 Técnico Especialista (Órdenes)</MenuItem>
                  <MenuItem value="AGENT">💬 Operador Soporte (WhatsApp)</MenuItem>
                </TextField>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.isActive}
                    disabled={currentSessionUser?.id === editingUser.id}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    color="success"
                  />
                }
                label={editForm.isActive ? 'Usuario Activo' : 'Usuario Inactivo'}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setEditingUser(null)} color="inherit" sx={{ textTransform: 'none' }}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmittingEdit}
                sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, fontWeight: 'bold', textTransform: 'none' }}
              >
                {isSubmittingEdit ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: CAMBIAR CONTRASEÑA                                */}
      {/* ======================================================== */}
      <Dialog
        open={Boolean(passwordModalUser)}
        onClose={() => !isSubmittingPassword && setPasswordModalUser(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        {passwordModalUser && (
          <form onSubmit={handleChangePasswordSubmit}>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Cambiar Contraseña</span>
              <IconButton size="small" onClick={() => setPasswordModalUser(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Establece una nueva clave de acceso para <strong>{passwordModalUser.name}</strong> ({passwordModalUser.email}).
              </Typography>

              <TextField
                label="Nueva Contraseña"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label="Confirmar Nueva Contraseña"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
              />
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setPasswordModalUser(null)} color="inherit" sx={{ textTransform: 'none' }}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmittingPassword}
                sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, fontWeight: 'bold', textTransform: 'none' }}
              >
                {isSubmittingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: CAMBIO RÁPIDO DE ROL                              */}
      {/* ======================================================== */}
      <Dialog
        open={Boolean(quickRoleModalUser)}
        onClose={() => !isSubmittingQuickRole && setQuickRoleModalUser(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        {quickRoleModalUser && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Cambiar Rol de Usuario</span>
              <IconButton size="small" onClick={() => setQuickRoleModalUser(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Selecciona el nuevo rol asignado para <strong>{quickRoleModalUser.name}</strong>:
              </Typography>

              <TextField
                select
                label="Rol en la Empresa"
                value={quickSelectedRole}
                onChange={(e) => setQuickSelectedRole(e.target.value as any)}
                fullWidth
              >
                <MenuItem value="ADMIN">🛡️ Administrador (Acceso total y configuración)</MenuItem>
                <MenuItem value="TECHNICIAN">🔧 Técnico Especialista (Gestión técnica de órdenes)</MenuItem>
                <MenuItem value="AGENT">💬 Operador Soporte (Atención WhatsApp)</MenuItem>
              </TextField>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setQuickRoleModalUser(null)} color="inherit" sx={{ textTransform: 'none' }}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveQuickRole}
                disabled={isSubmittingQuickRole}
                sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, fontWeight: 'bold', textTransform: 'none' }}
              >
                {isSubmittingQuickRole ? 'Guardando...' : 'Guardar Rol'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar de retroalimentación */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
