'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from '@mui/material';
import {
  WhatsApp,
  Assignment,
  SmartToy,
  Engineering,
  ArrowForward,
  Place,
} from '@mui/icons-material';

export default function DashboardView() {
  const kpis = [
    {
      title: 'Chats WhatsApp Activos',
      value: '14',
      subtitle: '3 esperando respuesta',
      icon: <WhatsApp sx={{ fontSize: 32, color: '#25D366' }} />,
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0',
    },
    {
      title: 'Tickets Escalados por IA',
      value: '8',
      subtitle: '6 con prioridad alta',
      icon: <SmartToy sx={{ fontSize: 32, color: '#0284c7' }} />,
      bgColor: '#e0f2fe',
      borderColor: '#bae6fd',
    },
    {
      title: 'Visitas Físicas en Local',
      value: '5',
      subtitle: 'Coordinadas para hoy',
      icon: <Place sx={{ fontSize: 32, color: '#ea580c' }} />,
      bgColor: '#fff7ed',
      borderColor: '#fed7aa',
    },
    {
      title: 'Técnicos en Línea',
      value: '4',
      subtitle: '100% disponibilidad',
      icon: <Engineering sx={{ fontSize: 32, color: '#128C7E' }} />,
      bgColor: '#f8fafc',
      borderColor: '#e2e8f0',
    },
  ];

  const recentTickets = [
    {
      id: 'TCK-1042',
      customer: 'Sanatorio San Lucas S.R.L.',
      equipment: 'Ecoflex 3000 (S/N: ECO-9923)',
      issue: 'Error E-402, sobrecalentamiento en etapa de potencia',
      serviceType: 'ONSITE_PHYSICAL',
      priority: 'HIGH',
      status: 'OPEN',
      aiDiagnostic: 'Riesgo eléctrico. Se requiere técnico presencial con multímetro y fusible de 15A.',
      time: 'Hace 10 min',
    },
    {
      id: 'TCK-1041',
      customer: 'Laboratorio BioTest',
      equipment: 'Centrifugadora C-20 (S/N: CEN-4412)',
      issue: 'Falla de calibración de RPM en panel digital',
      serviceType: 'REMOTE_WHATSAPP',
      priority: 'MEDIUM',
      status: 'ASSIGNED',
      aiDiagnostic: 'Problema de configuración en menú de servicio. Guiar reseteo remoto.',
      time: 'Hace 25 min',
    },
    {
      id: 'TCK-1040',
      customer: 'Clínica Las Palmeras',
      equipment: 'Monitor Multiparamétrico MP-50',
      issue: 'Sin lectura en canal de saturación de O2',
      serviceType: 'REMOTE_WHATSAPP',
      priority: 'LOW',
      status: 'RESOLVED',
      aiDiagnostic: 'Sensor desconectado físicamente en puerto 2.',
      time: 'Hace 1 hora',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Page Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
            Panel de Control & Soporte Técnico IA
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitoreo en vivo de WhatsApp, triaje automatizado por IA y órdenes de servicio
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            component={Link}
            href="/chat"
            variant="contained"
            startIcon={<WhatsApp />}
            sx={{ bgcolor: '#128C7E', '&:hover': { bgcolor: '#0b6e62' } }}
          >
            Bandeja WhatsApp
          </Button>
          <Button
            component={Link}
            href="/tickets"
            variant="outlined"
            startIcon={<Assignment />}
          >
            Ver Tickets
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            sx={{
              borderRadius: 2.5,
              border: `1px solid ${kpi.borderColor}`,
              bgcolor: '#ffffff',
              boxShadow: 'none',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748b' }}>
                  {kpi.title.toUpperCase()}
                </Typography>
                <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: kpi.bgColor }}>{kpi.icon}</Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                {kpi.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {kpi.subtitle}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Recent AI Tickets Table */}
      <Card sx={{ borderRadius: 2.5, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Últimos Casos Diagnosticados por la IA
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Triaje Nivel 1 ejecutado tras interacción por WhatsApp
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/tickets"
              size="small"
              endIcon={<ArrowForward />}
            >
              Ver todos los tickets
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ticket</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cliente / Razón Social</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Equipo Involucrado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Modalidad Determinada</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Diagnóstico de la IA</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTickets.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {row.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.time}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.customer}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.equipment}</TableCell>
                    <TableCell>
                      {row.serviceType === 'ONSITE_PHYSICAL' ? (
                        <Chip
                          size="small"
                          color="error"
                          label="Visita Presencial en Local"
                          sx={{ fontWeight: 'bold' }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          color="info"
                          label="Remoto por WhatsApp"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography variant="caption" sx={{ color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {row.aiDiagnostic}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.status === 'OPEN' ? 'Pendiente' : row.status === 'ASSIGNED' ? 'En Atención' : 'Resuelto'}
                        color={row.status === 'OPEN' ? 'warning' : row.status === 'ASSIGNED' ? 'primary' : 'success'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
