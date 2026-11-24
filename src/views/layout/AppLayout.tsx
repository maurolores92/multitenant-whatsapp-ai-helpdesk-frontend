'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Drawer,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Wifi,
  WifiOff,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import SidebarNavigation from './SidebarNavigation';
import { useSocket, disconnectGlobalSocket } from '@/hooks/useSocket';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState<HTMLButtonElement | null>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Sistema Iniciado',
      body: 'Servicios WebSocket y base de datos conectados',
      time: 'Hace un momento',
    },
  ]);

  // Protección de autenticación estricta: si no hay sesión, va a /login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');

      if (!token || !userStr) {
        disconnectGlobalSocket();
        router.push('/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);

        // Si es Superadmin y está en /, redirigir a /companies
        if (user.role === 'SUPER_ADMIN' && (pathname === '/' || pathname === '/dashboard')) {
          router.push('/companies');
          return;
        }

        // Si es usuario regular y trata de acceder a /companies, redirigir a /dashboard
        if (user.role !== 'SUPER_ADMIN' && pathname === '/companies') {
          router.push('/dashboard');
          return;
        }

        // Si el usuario no es ADMIN ni SUPER_ADMIN y trata de acceder a /users, denegar acceso
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && pathname === '/users') {
          router.push('/dashboard');
          return;
        }
      } catch (e) {
        disconnectGlobalSocket();
        localStorage.clear();
        router.push('/login');
        return;
      } finally {
        setIsLoadingAuth(false);
      }
    }
  }, [router, pathname]);

  const handleNotification = useCallback((notif: any) => {
    if (notif) {
      setNotifications((prev) => [
        {
          id: notif.id || Date.now().toString(),
          title: notif.title,
          body: notif.body,
          time: 'Ahora',
        },
        ...prev,
      ]);
    }
  }, []);

  const { isConnected } = useSocket({
    onNotification: handleNotification,
  });

  const handleLogout = () => {
    disconnectGlobalSocket();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    router.push('/login');
  };

  if (isLoadingAuth) {
    return (
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#0f172a',
          color: '#ffffff',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: '#128C7E' }} />
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          Verificando sesión...
        </Typography>
      </Box>
    );
  }

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: '#f8fafc' }}>
      {/* Sidebar Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, height: '100%' }}>
        <SidebarNavigation
          userRole={currentUser?.role}
          userPermissions={currentUser?.permissions || []}
          tenantName={currentUser?.tenant?.name || 'Administración Central'}
        />
      </Box>

      {/* Sidebar Drawer Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260 },
        }}
      >
        <SidebarNavigation
          userRole={currentUser?.role}
          userPermissions={currentUser?.permissions || []}
          tenantName={currentUser?.tenant?.name || 'Administración Central'}
        />
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Top Header */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#ffffff', color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {isSuperAdmin ? 'Panel de Control Superadmin' : currentUser?.tenant?.name || 'HelpDesk CRM'}
              </Typography>
            </Box>

            {/* Right Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* WebSocket Status Indicator */}
              <Chip
                icon={isConnected ? <Wifi sx={{ fontSize: 16 }} /> : <WifiOff sx={{ fontSize: 16 }} />}
                label={isConnected ? 'Socket Online' : 'Socket Offline'}
                color={isConnected ? 'success' : 'default'}
                variant={isConnected ? 'filled' : 'outlined'}
                size="small"
                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
              />

              {/* Notifications Popover */}
              <IconButton
                color="inherit"
                onClick={(e) => setNotifAnchor(e.currentTarget)}
                sx={{ bgcolor: '#f1f5f9' }}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>

              <Popover
                open={Boolean(notifAnchor)}
                anchorEl={notifAnchor}
                onClose={() => setNotifAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: { width: 340, maxHeight: 420, borderRadius: 2, p: 1 },
                  },
                }}
              >
                <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Notificaciones en Vivo
                  </Typography>
                  <Button size="small" onClick={() => setNotifications([])}>
                    Limpiar
                  </Button>
                </Box>
                <Divider />
                <List sx={{ p: 0 }}>
                  {notifications.map((n) => (
                    <ListItem key={n.id} sx={{ px: 1.5, py: 1, borderBottom: '1px solid #f1f5f9' }}>
                      <ListItemText
                        primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{n.title}</Typography>}
                        secondary={
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {n.body} • {n.time}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Popover>

              <Divider orientation="vertical" flexItem sx={{ my: 1.5 }} />

              {/* User Avatar & Menu */}
              <Box
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  cursor: 'pointer',
                  p: 0.5,
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#f1f5f9' },
                }}
              >
                <Avatar sx={{ bgcolor: isSuperAdmin ? '#0284c7' : '#128C7E', width: 36, height: 36, fontSize: '0.875rem' }}>
                  {currentUser?.name?.charAt(0) || 'U'}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                    {currentUser?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {currentUser?.role}
                  </Typography>
                </Box>
              </Box>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem disabled>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Conectado como {currentUser?.email}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Dynamic Page View Body */}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
