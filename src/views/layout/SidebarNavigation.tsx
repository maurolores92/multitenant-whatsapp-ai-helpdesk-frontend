'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  WhatsApp as WhatsAppIcon,
  Assignment as AssignmentIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  Settings as SettingsIcon,
  SmartToy as SmartToyIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { NAVIGATION_ITEMS, NavigationItem } from '@/navigation/navigationItems';

interface SidebarNavigationProps {
  userRole?: string;
  userPermissions?: string[];
  tenantName?: string;
}

export default function SidebarNavigation({
  userRole = 'ADMIN',
  userPermissions = [],
  tenantName = 'TecnoServicios Pro S.A.',
}: SidebarNavigationProps) {
  const pathname = usePathname();

  const getIcon = (name: NavigationItem['iconName']) => {
    switch (name) {
      case 'Business':
        return <BusinessIcon sx={{ color: '#38bdf8' }} />;
      case 'Dashboard':
        return <DashboardIcon sx={{ color: '#3b82f6' }} />;
      case 'WhatsApp':
        return <WhatsAppIcon sx={{ color: '#25D366' }} />;
      case 'Assignment':
        return <AssignmentIcon sx={{ color: '#f59e0b' }} />;
      case 'PrecisionManufacturing':
        return <PrecisionManufacturingIcon sx={{ color: '#ea580c' }} />;
      case 'People':
        return <PeopleIcon sx={{ color: '#818cf8' }} />;
      case 'Settings':
        return <SettingsIcon />;
      default:
        return <DashboardIcon />;
    }
  };

  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  // Filtrado de opciones del menú según el rol y permisos
  const visibleItems = NAVIGATION_ITEMS.filter((item) => {
    if (isSuperAdmin) {
      return item.superAdminOnly === true;
    }

    if (item.superAdminOnly) {
      return false;
    }

    if (item.adminOnly && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return false;
    }

    if (item.requiredPermission && !userPermissions.includes(item.requiredPermission)) {
      return false;
    }

    return true;
  });

  return (
    <Box
      sx={{
        width: 260,
        height: '100%',
        bgcolor: '#0f172a',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: isSuperAdmin ? '#0284c7' : '#128C7E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isSuperAdmin ? (
            <BusinessIcon sx={{ color: '#ffffff', fontSize: 24 }} />
          ) : (
            <SmartToyIcon sx={{ color: '#ffffff', fontSize: 24 }} />
          )}
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            {isSuperAdmin ? 'Panel Maestro' : 'HelpDesk IA'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            {isSuperAdmin ? 'Superadministrador' : 'CRM WhatsApp Multi-Tenant'}
          </Typography>
        </Box>
      </Box>

      {/* Tenant Pill */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box
          sx={{
            p: 1.2,
            borderRadius: 1.5,
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>
            {isSuperAdmin ? 'ÁMBITO DEL SISTEMA' : 'EMPRESA ACTIVA'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: isSuperAdmin ? '#38bdf8' : '#f8fafc',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {isSuperAdmin ? '🌐 Plataforma Global' : tenantName}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Navigation List */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {visibleItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 1.5,
                  bgcolor: isActive ? (isSuperAdmin ? '#0284c7' : '#128C7E') : 'transparent',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  '&:hover': {
                    bgcolor: isActive
                      ? (isSuperAdmin ? '#0369a1' : '#0e7064')
                      : 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? '#ffffff' : '#94a3b8',
                  }}
                >
                  {getIcon(item.iconName)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {item.title}
                    </Typography>
                  }
                />
                {item.badge && (
                  <Chip
                    size="small"
                    label={item.badge}
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      bgcolor: isActive ? 'rgba(255, 255, 255, 0.25)' : '#334155',
                      color: '#ffffff',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer Info */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', textAlign: 'center' }}>
          {isSuperAdmin ? 'Superadmin Mode' : 'WhatsApp Cloud API Oficial'}
        </Typography>
      </Box>
    </Box>
  );
}
