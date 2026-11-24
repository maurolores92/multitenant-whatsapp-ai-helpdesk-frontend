'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  InputAdornment,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  SmartToy as SmartToyIcon,
  WhatsApp as WhatsAppIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Build as BuildIcon,
  PrecisionManufacturing as EquipmentIcon,
  OpenInNew as OpenInNewIcon,
  ReceiptLong as ReceiptLongIcon,
  Send as SendIcon,
} from '@mui/icons-material';

export interface TicketItem {
  id: string;
  title: string;
  customerName: string;
  companyName: string;
  phone: string;
  address: string;
  equipmentName: string;
  equipmentModel: string;
  equipmentSn: string;
  serviceType: 'ONSITE_PHYSICAL' | 'REMOTE_WHATSAPP';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  serviceOrderNumber?: string;
  aiDiagnostic: string;
  time: string;
  resolutionNotes?: string;
}

export default function TicketsView() {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [editingTicket, setEditingTicket] = useState<TicketItem | null>(null);
  
  // Modal: Notificar Orden de Servicio por WhatsApp
  const [orderModalTicket, setOrderModalTicket] = useState<TicketItem | null>(null);
  const [serviceOrderInput, setServiceOrderInput] = useState('');
  const [whatsappMessageInput, setWhatsappMessageInput] = useState('');
  const [isSendingOrder, setIsSendingOrder] = useState(false);

  // Modal: Cambio Rápido de Modalidad, Prioridad o Estado al hacer clic en los items
  const [quickEditModal, setQuickEditModal] = useState<{
    ticket: TicketItem;
    field: 'serviceType' | 'priority' | 'status';
    selectedValue: string;
  } | null>(null);
  const [isSavingQuickEdit, setIsSavingQuickEdit] = useState(false);

  // Formulario de edición rápida de estado / prioridad
  const [editForm, setEditForm] = useState<{
    status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    resolutionNotes: string;
  }>({
    status: 'OPEN',
    priority: 'HIGH',
    resolutionNotes: '',
  });

  const [notification, setNotification] = useState<string | null>(null);

  const [tickets, setTickets] = useState<TicketItem[]>([
    {
      id: 'TCK-1042',
      title: 'Incidencia WhatsApp: Error E-402 con sobrecalentamiento',
      customerName: 'Roberto Gómez',
      companyName: 'Sanatorio San Lucas S.R.L.',
      phone: '+54 9 11 4444-2233',
      address: 'Av. Libertador 4200, Piso 3',
      equipmentName: 'Ecoflex 3000',
      equipmentModel: 'Sonix Med / ECO-3000',
      equipmentSn: 'ECO-9923',
      serviceType: 'ONSITE_PHYSICAL',
      priority: 'HIGH',
      status: 'OPEN',
      serviceOrderNumber: '',
      aiDiagnostic:
        'El cliente reportó olor a quemado y fallo tras error E-402. La IA determinó riesgo eléctrico y suspendió el encendido forzado. Se requiere técnico presencial en local con multímetro y reemplazo de fusible primario de 15A.',
      time: '14:06 (Hace 15 min)',
    },
    {
      id: 'TCK-1041',
      title: 'Incidencia WhatsApp: Calibración desajustada en panel',
      customerName: 'Mariana Costa',
      companyName: 'Laboratorio BioTest',
      phone: '+54 9 11 3333-8899',
      address: 'Calle 50 N° 1234, La Plata',
      equipmentName: 'Centrifugadora C-20',
      equipmentModel: 'BioLab / C-20',
      equipmentSn: 'CEN-4412',
      serviceType: 'REMOTE_WHATSAPP',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      serviceOrderNumber: 'OS-80412',
      aiDiagnostic:
        'Lectura de RPM desfasada en pantalla digital. No hay daño mecánico evidente. La IA determinó asistencia remota vía WhatsApp para guiar combinación de botones de reseteo de fábrica.',
      time: '13:49 (Hace 45 min)',
    },
    {
      id: 'TCK-1040',
      title: 'Incidencia WhatsApp: Sensor de saturación sin lectura',
      customerName: 'Dr. Varela',
      companyName: 'Clínica Las Palmeras',
      phone: '+54 9 11 2222-1144',
      address: 'Av. Belgrano 850, CABA',
      equipmentName: 'Monitor Multiparamétrico MP-50',
      equipmentModel: 'Philips / MP-50',
      equipmentSn: 'PH-8812',
      serviceType: 'REMOTE_WHATSAPP',
      priority: 'LOW',
      status: 'RESOLVED',
      serviceOrderNumber: 'OS-80399',
      aiDiagnostic:
        'Sensor desconectado en canal trasero. Resuelto mediante guía técnica paso a paso por WhatsApp. Conexión restablecida en puerto auxiliar.',
      time: '11:35 (Hace 3 horas)',
      resolutionNotes: 'El cliente confirmó funcionamiento óptimo tras conectar en canal secundario.',
    },
  ]);

  // Cargar tickets desde la API si está disponible
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl || !token) return;

        const res = await fetch(`${apiUrl}/tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: TicketItem[] = data.map((t: any) => ({
              id: t.id ? (t.id.startsWith('TCK') ? t.id : `TCK-${t.id.slice(-4).toUpperCase()}`) : 'TCK-0000',
              title: t.title || 'Incidencia de Servicio',
              customerName: t.customer?.name || 'Cliente WhatsApp',
              companyName: t.customer?.name || 'Empresa Cliente',
              phone: t.customer?.phone || '',
              address: t.customer?.address || 'Sin dirección',
              equipmentName: t.equipment?.name || 'Equipo General',
              equipmentModel: t.equipment?.model || 'Modelo no especificado',
              equipmentSn: t.equipment?.serialNumber || 'S/N Desconocido',
              serviceType: t.serviceType || 'REMOTE_WHATSAPP',
              priority: t.priority || 'MEDIUM',
              status: t.status || 'OPEN',
              serviceOrderNumber: t.serviceOrderNumber || '',
              aiDiagnostic: t.aiDiagnostic || t.description || 'Sin diagnóstico registrado.',
              time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              resolutionNotes: t.resolutionNotes || '',
            }));
            setTickets(mapped);
          }
        }
      } catch {}
    };

    fetchTickets();
  }, []);

  // Métricas
  const totalCount = tickets.length;
  const onsiteCount = tickets.filter((t) => t.serviceType === 'ONSITE_PHYSICAL').length;
  const remoteCount = tickets.filter((t) => t.serviceType === 'REMOTE_WHATSAPP').length;
  const pendingCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length;

  // Filtrado
  const filteredTickets = tickets.filter((t) => {
    if (currentTab === 1 && t.serviceType !== 'ONSITE_PHYSICAL') return false;
    if (currentTab === 2 && t.serviceType !== 'REMOTE_WHATSAPP') return false;
    if (currentTab === 3 && t.status === 'RESOLVED') return false;
    if (currentTab === 4 && t.status !== 'RESOLVED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = t.id.toLowerCase().includes(q);
      const matchCustomer = t.customerName.toLowerCase().includes(q) || t.companyName.toLowerCase().includes(q);
      const matchPhone = t.phone.toLowerCase().includes(q);
      const matchEq = t.equipmentName.toLowerCase().includes(q) || t.equipmentSn.toLowerCase().includes(q);
      const matchOrder = (t.serviceOrderNumber || '').toLowerCase().includes(q);
      const matchDiagnostic = t.aiDiagnostic.toLowerCase().includes(q);
      return matchId || matchCustomer || matchPhone || matchEq || matchOrder || matchDiagnostic;
    }

    return true;
  });

  // ========================================================
  // GENERAR MENSAJE PROFESIONAL POR DEFAULT PARA WHATSAPP
  // ========================================================
  const buildDefaultWhatsAppMessage = (ticket: TicketItem, orderNum: string) => {
    const orderText = orderNum.trim() || '######';
    return `Estimado/a ${ticket.customerName}, le informamos que se ha generado la *Orden de Servicio N° ${orderText}* para la atención técnica de su reclamo sobre el equipo *${ticket.equipmentName}* (S/N: ${ticket.equipmentSn}). Nuestro equipo técnico ya se encuentra gestionando su solicitud con la máxima prioridad. Muchas gracias por confiar en HelpCopies SRL.`;
  };

  const handleOpenOrderModal = (ticket: TicketItem) => {
    setOrderModalTicket(ticket);
    const initialOrder = ticket.serviceOrderNumber || '';
    setServiceOrderInput(initialOrder);
    setWhatsappMessageInput(buildDefaultWhatsAppMessage(ticket, initialOrder));
  };

  const handleOrderNumberChange = (newOrder: string) => {
    setServiceOrderInput(newOrder);
    if (orderModalTicket) {
      setWhatsappMessageInput(buildDefaultWhatsAppMessage(orderModalTicket, newOrder));
    }
  };

  const handleSendOrderToWhatsApp = async () => {
    if (!orderModalTicket || !serviceOrderInput.trim()) return;

    setIsSendingOrder(true);
    const orderNum = serviceOrderInput.trim();

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (apiUrl && token) {
        await fetch(`${apiUrl}/tickets/${orderModalTicket.id}/notify-service-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            serviceOrderNumber: orderNum,
            customMessage: whatsappMessageInput.trim(),
          }),
        }).catch(() => {});
      }
    } catch {}

    // Actualizar estado local
    setTickets((prev) =>
      prev.map((t) =>
        t.id === orderModalTicket.id
          ? {
              ...t,
              serviceOrderNumber: orderNum,
              status: t.status === 'OPEN' ? 'IN_PROGRESS' : t.status,
            }
          : t
      )
    );

    setIsSendingOrder(false);
    setOrderModalTicket(null);
    setNotification(`¡Orden de Servicio N° ${orderNum} vinculada y enviada a WhatsApp con éxito!`);
  };

  const handleOpenEdit = (ticket: TicketItem) => {
    setEditingTicket(ticket);
    setEditForm({
      status: ticket.status,
      priority: ticket.priority,
      resolutionNotes: ticket.resolutionNotes || '',
    });
  };

  const handleSaveEdit = () => {
    if (!editingTicket) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === editingTicket.id
          ? {
              ...t,
              status: editForm.status,
              priority: editForm.priority,
              resolutionNotes: editForm.resolutionNotes,
            }
          : t
      )
    );

    setNotification(`Ticket #${editingTicket.id} actualizado correctamente`);
    setEditingTicket(null);
  };

  const handleSaveQuickEdit = async () => {
    if (!quickEditModal) return;
    setIsSavingQuickEdit(true);

    const { ticket, field, selectedValue } = quickEditModal;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl && token) {
        await fetch(`${apiUrl}/tickets/${ticket.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [field]: selectedValue }),
        }).catch(() => {});
      }
    } catch {}

    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, [field]: selectedValue } : t))
    );

    if (selectedTicket && selectedTicket.id === ticket.id) {
      setSelectedTicket((prev) => (prev ? { ...prev, [field]: selectedValue } : null));
    }

    const fieldLabel =
      field === 'serviceType' ? 'Modalidad' : field === 'priority' ? 'Prioridad' : 'Estado';

    setNotification(`¡${fieldLabel} del ticket #${ticket.id} actualizada con éxito!`);
    setIsSavingQuickEdit(false);
    setQuickEditModal(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Encabezado Principal */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
            Órdenes de Servicio & Tickets (IA y Técnicos)
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Listado con columnas y filas de reclamos derivados por WhatsApp y vinculación con Órdenes de Servicio
          </Typography>
        </Box>
        <Chip
          icon={<SmartToyIcon sx={{ fontSize: '1rem !important', color: '#0284c7' }} />}
          label="Triaje Nivel 1 Autónomo Activo"
          sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600, px: 0.5 }}
        />
      </Box>

      {/* Tarjetas de Métricas KPI */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#e0f2fe', color: '#0284c7', borderRadius: 2 }}>
                <AssignmentIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  TICKETS TOTALES
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                  {totalCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#fff7ed', color: '#ea580c', borderRadius: 2 }}>
                <BuildIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  VISITAS PRESENCIALES
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                  {onsiteCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', color: '#128C7E', borderRadius: 2 }}>
                <WhatsAppIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  SOPORTE REMOTO WHATSAPP
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                  {remoteCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#fef3c7', color: '#d97706', borderRadius: 2 }}>
                <WarningIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  PENDIENTES DE ATENCIÓN
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                  {pendingCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contenedor de Tabla con Filtros */}
      <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        {/* Barra Superior: Buscador y Pestañas */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Tabs
            value={currentTab}
            onChange={(_, val) => setCurrentTab(val)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
              },
            }}
          >
            <Tab label={`Todos (${totalCount})`} />
            <Tab label={`🚗 Visita Presencial (${onsiteCount})`} />
            <Tab label={`💬 Soporte Remoto (${remoteCount})`} />
            <Tab label={`⏳ Pendientes (${pendingCount})`} />
            <Tab label="✅ Resueltos" />
          </Tabs>

          <TextField
            size="small"
            placeholder="Buscar por ticket, orden, cliente, equipo..."
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
            sx={{ minWidth: 320 }}
          />
        </Box>

        {/* Tabla con Columnas y Filas (HelpCopies ERP Style) */}
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 950 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>Ticket #</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>Cliente / Empresa</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>Equipo Involucrado</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>Modalidad</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>Prioridad</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>Orden de Servicio</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>Diagnóstico IA</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#64748b' }}>
                    <AssignmentIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      No se encontraron órdenes de servicio con los filtros aplicados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => {
                  const isOnsite = ticket.serviceType === 'ONSITE_PHYSICAL';

                  const priorityColor =
                    ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH'
                      ? 'error'
                      : ticket.priority === 'MEDIUM'
                      ? 'warning'
                      : 'default';

                  const statusColor =
                    ticket.status === 'RESOLVED'
                      ? 'success'
                      : ticket.status === 'IN_PROGRESS' || ticket.status === 'ASSIGNED'
                      ? 'primary'
                      : 'warning';

                  const statusLabel =
                    ticket.status === 'OPEN'
                      ? 'Pendiente'
                      : ticket.status === 'ASSIGNED'
                      ? 'Asignado'
                      : ticket.status === 'IN_PROGRESS'
                      ? 'En Atención'
                      : 'Resuelto';

                  return (
                    <TableRow
                      key={ticket.id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      {/* Ticket # & Hora */}
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0284c7' }}>
                          #{ticket.id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {ticket.time}
                        </Typography>
                      </TableCell>

                      {/* Cliente / Empresa */}
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                          {ticket.customerName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                          {ticket.companyName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#128C7E', fontWeight: 500 }}>
                          {ticket.phone}
                        </Typography>
                      </TableCell>

                      {/* Equipo Involucrado */}
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <EquipmentIcon fontSize="small" sx={{ color: isOnsite ? '#ea580c' : '#128C7E' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {ticket.equipmentName}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                          S/N: {ticket.equipmentSn}
                        </Typography>
                      </TableCell>

                      {/* Modalidad de Asistencia (Clic para cambiar) */}
                      <TableCell sx={{ py: 2 }} onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Clic para cambiar modalidad (Visita vs Remoto)" arrow placement="top">
                          <Chip
                            size="small"
                            color={isOnsite ? 'error' : 'info'}
                            label={isOnsite ? '🚗 Visita Presencial' : '💬 Remoto WhatsApp'}
                            onClick={() =>
                              setQuickEditModal({
                                ticket,
                                field: 'serviceType',
                                selectedValue: ticket.serviceType,
                              })
                            }
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              height: 22,
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.85, boxShadow: 1 },
                            }}
                          />
                        </Tooltip>
                      </TableCell>

                      {/* Prioridad (Clic para cambiar) */}
                      <TableCell sx={{ py: 2 }} onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Clic para cambiar nivel de prioridad" arrow placement="top">
                          <Chip
                            size="small"
                            label={ticket.priority}
                            color={priorityColor as any}
                            variant="outlined"
                            onClick={() =>
                              setQuickEditModal({
                                ticket,
                                field: 'priority',
                                selectedValue: ticket.priority,
                              })
                            }
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '0.68rem',
                              height: 20,
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
                            }}
                          />
                        </Tooltip>
                      </TableCell>

                      {/* Estado (Clic para cambiar) */}
                      <TableCell sx={{ py: 2 }} onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Clic para cambiar estado de la orden" arrow placement="top">
                          <Chip
                            size="small"
                            label={statusLabel}
                            color={statusColor as any}
                            onClick={() =>
                              setQuickEditModal({
                                ticket,
                                field: 'status',
                                selectedValue: ticket.status,
                              })
                            }
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 22,
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.85, boxShadow: 1 },
                            }}
                          />
                        </Tooltip>
                      </TableCell>

                      {/* Orden de Servicio (N° de Orden Tango / ERP) */}
                      <TableCell sx={{ py: 2 }}>
                        {ticket.serviceOrderNumber ? (
                          <Chip
                            size="small"
                            icon={<ReceiptLongIcon sx={{ fontSize: '0.85rem !important' }} />}
                            label={ticket.serviceOrderNumber}
                            color="secondary"
                            sx={{ fontWeight: 'bold', fontSize: '0.75rem', height: 24, bgcolor: '#f3e8ff', color: '#7c3aed' }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                            Sin N° de Orden
                          </Typography>
                        )}
                      </TableCell>

                      {/* Diagnóstico IA Resumen */}
                      <TableCell sx={{ py: 2, maxWidth: 220 }}>
                        <Tooltip title={ticket.aiDiagnostic} arrow placement="top">
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                            <SmartToyIcon sx={{ fontSize: 16, color: '#0284c7', mt: 0.3, flexShrink: 0 }} />
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#334155',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.3,
                              }}
                            >
                              {ticket.aiDiagnostic}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>

                      {/* Acciones: Exclusivamente Iconos con Tooltip */}
                      <TableCell align="right" sx={{ py: 2 }} onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                          <Tooltip title="Ir a la conversación en vivo en WhatsApp" arrow placement="top">
                            <IconButton
                              component={Link}
                              href="/chat"
                              size="small"
                              sx={{ color: '#128C7E', '&:hover': { bgcolor: '#e6fffa' } }}
                            >
                              <WhatsAppIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Generar / Notificar Orden de Servicio a WhatsApp" arrow placement="top">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenOrderModal(ticket)}
                              sx={{ color: '#7c3aed', '&:hover': { bgcolor: '#f3e8ff' } }}
                            >
                              <ReceiptLongIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Ver Detalle y Diagnóstico IA" arrow placement="top">
                            <IconButton
                              size="small"
                              onClick={() => setSelectedTicket(ticket)}
                              sx={{ color: '#0284c7', '&:hover': { bgcolor: '#e0f2fe' } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Actualizar Estado / Prioridad" arrow placement="top">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(ticket)}
                              sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ======================================================== */}
      {/* MODAL: GENERAR / NOTIFICAR ORDEN DE SERVICIO A WHATSAPP */}
      {/* ======================================================== */}
      <Dialog
        open={Boolean(orderModalTicket)}
        onClose={() => setOrderModalTicket(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        {orderModalTicket && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongIcon sx={{ color: '#7c3aed' }} />
                <span>Generar Orden de Servicio para Reclamo #{orderModalTicket.id}</span>
              </Box>
              <IconButton size="small" onClick={() => setOrderModalTicket(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Ingresa el número de orden de servicio asignado para atender a <strong>{orderModalTicket.customerName}</strong> ({orderModalTicket.companyName}). Podrás revisar y ajustar el mensaje antes de enviarlo por la línea oficial de WhatsApp.
              </Alert>

              <TextField
                label="Número de Orden de Servicio (Tango ERP / Interno)"
                placeholder="Ej: OS-50824 o 0001-00045231"
                value={serviceOrderInput}
                onChange={(e) => handleOrderNumberChange(e.target.value)}
                required
                fullWidth
                autoFocus
                helperText="Identificador con el que se registrará el trabajo técnico"
              />

              <TextField
                label="Mensaje Oficial a Enviar por WhatsApp"
                value={whatsappMessageInput}
                onChange={(e) => setWhatsappMessageInput(e.target.value)}
                multiline
                rows={4}
                fullWidth
                helperText="Mensaje profesional que recibirá el cliente de inmediato por WhatsApp"
              />

              <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748b', display: 'block', mb: 0.5 }}>
                  Destinatario WhatsApp:
                </Typography>
                <Typography variant="body2" sx={{ color: '#128C7E', fontWeight: 600 }}>
                  {orderModalTicket.customerName} • {orderModalTicket.phone}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setOrderModalTicket(null)} color="inherit" sx={{ textTransform: 'none' }}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSendOrderToWhatsApp}
                disabled={!serviceOrderInput.trim() || isSendingOrder}
                startIcon={<WhatsAppIcon />}
                endIcon={<SendIcon />}
                sx={{
                  bgcolor: '#128C7E',
                  '&:hover': { bgcolor: '#075E54' },
                  fontWeight: 'bold',
                  textTransform: 'none',
                  px: 3,
                }}
              >
                {isSendingOrder ? 'Enviando...' : 'Enviar a WhatsApp'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: VER DETALLE DEL TICKET & DIAGNÓSTICO IA COMPLETO  */}
      {/* ======================================================== */}
      <Dialog
        open={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        {selectedTicket && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon sx={{ color: '#0284c7' }} />
                <span>Detalle del Ticket #{selectedTicket.id}</span>
              </Box>
              <IconButton size="small" onClick={() => setSelectedTicket(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              {/* Box Diagnóstico de la IA */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: selectedTicket.serviceType === 'ONSITE_PHYSICAL' ? '#fff7ed' : '#f0fdf4',
                  borderLeft: selectedTicket.serviceType === 'ONSITE_PHYSICAL' ? '4px solid #ea580c' : '4px solid #16a34a',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SmartToyIcon sx={{ color: selectedTicket.serviceType === 'ONSITE_PHYSICAL' ? '#ea580c' : '#16a34a' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: selectedTicket.serviceType === 'ONSITE_PHYSICAL' ? '#9a3412' : '#166534' }}>
                    Diagnóstico Formulado por la IA (Nivel 1):
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {selectedTicket.aiDiagnostic}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                  <Tooltip title="Clic para cambiar modalidad" arrow placement="top">
                    <Chip
                      size="small"
                      color={selectedTicket.serviceType === 'ONSITE_PHYSICAL' ? 'error' : 'info'}
                      label={selectedTicket.serviceType === 'ONSITE_PHYSICAL' ? '🚗 Visita Presencial en Local' : '💬 Atención Remota WhatsApp'}
                      onClick={() =>
                        setQuickEditModal({
                          ticket: selectedTicket,
                          field: 'serviceType',
                          selectedValue: selectedTicket.serviceType,
                        })
                      }
                      sx={{ fontWeight: 'bold', cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
                    />
                  </Tooltip>
                  <Tooltip title="Clic para cambiar prioridad" arrow placement="top">
                    <Chip
                      size="small"
                      label={`Prioridad: ${selectedTicket.priority}`}
                      variant="outlined"
                      onClick={() =>
                        setQuickEditModal({
                          ticket: selectedTicket,
                          field: 'priority',
                          selectedValue: selectedTicket.priority,
                        })
                      }
                      sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
                    />
                  </Tooltip>
                  <Tooltip title="Clic para cambiar estado" arrow placement="top">
                    <Chip
                      size="small"
                      label={`Estado: ${
                        selectedTicket.status === 'OPEN'
                          ? 'Pendiente'
                          : selectedTicket.status === 'IN_PROGRESS'
                          ? 'En Atención'
                          : selectedTicket.status === 'ASSIGNED'
                          ? 'Asignado'
                          : 'Resuelto'
                      }`}
                      color={
                        selectedTicket.status === 'RESOLVED'
                          ? 'success'
                          : selectedTicket.status === 'IN_PROGRESS' || selectedTicket.status === 'ASSIGNED'
                          ? 'primary'
                          : 'warning'
                      }
                      onClick={() =>
                        setQuickEditModal({
                          ticket: selectedTicket,
                          field: 'status',
                          selectedValue: selectedTicket.status,
                        })
                      }
                      sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
                    />
                  </Tooltip>
                  {selectedTicket.serviceOrderNumber && (
                    <Chip
                      size="small"
                      icon={<ReceiptLongIcon sx={{ fontSize: '0.85rem !important' }} />}
                      label={`Orden: ${selectedTicket.serviceOrderNumber}`}
                      color="secondary"
                      sx={{ fontWeight: 'bold' }}
                    />
                  )}
                </Box>
              </Box>

              {/* Ficha del Cliente */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#0f172a' }}>
                  Datos del Cliente
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Contacto:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedTicket.customerName}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Empresa / Razón Social:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedTicket.companyName}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>WhatsApp:</Typography>
                    <Typography variant="body2" sx={{ color: '#128C7E', fontWeight: 600 }}>{selectedTicket.phone}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Dirección:</Typography>
                    <Typography variant="body2">{selectedTicket.address}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Ficha del Equipo */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#0f172a' }}>
                  Equipo Técnico
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Nombre:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedTicket.equipmentName}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Marca y Modelo:</Typography>
                    <Typography variant="body2">{selectedTicket.equipmentModel}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Número de Serie:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedTicket.equipmentSn}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Orden Vinculada:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: selectedTicket.serviceOrderNumber ? '#7c3aed' : '#94a3b8' }}>
                      {selectedTicket.serviceOrderNumber || 'Pendiente de asignar'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {selectedTicket.resolutionNotes && (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                    Notas de Resolución:
                  </Typography>
                  <Typography variant="body2">
                    {selectedTicket.resolutionNotes}
                  </Typography>
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                component={Link}
                href="/chat"
                variant="outlined"
                startIcon={<WhatsAppIcon />}
                endIcon={<OpenInNewIcon fontSize="small" />}
                sx={{ color: '#128C7E', borderColor: '#128C7E', textTransform: 'none', fontWeight: 'bold' }}
              >
                Ir a la conversación en WhatsApp
              </Button>
              <Button onClick={() => setSelectedTicket(null)} color="inherit" sx={{ textTransform: 'none' }}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>


      {/* ======================================================== */}
      {/* MODAL: EDITAR ESTADO / PRIORIDAD DEL TICKET              */}
      {/* ======================================================== */}
      <Dialog
        open={Boolean(editingTicket)}
        onClose={() => setEditingTicket(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        {editingTicket && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Actualizar Ticket #{editingTicket.id}</span>
              <IconButton size="small" onClick={() => setEditingTicket(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                select
                label="Estado de la Orden"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                fullWidth
              >
                <MenuItem value="OPEN">Pendiente (Sin iniciar)</MenuItem>
                <MenuItem value="IN_PROGRESS">En Atención / En Progreso</MenuItem>
                <MenuItem value="RESOLVED">Resuelto / Finalizado</MenuItem>
              </TextField>

              <TextField
                select
                label="Nivel de Prioridad"
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                fullWidth
              >
                <MenuItem value="CRITICAL">CRITICAL (Riesgo / Detención crítica)</MenuItem>
                <MenuItem value="HIGH">HIGH (Equipo fuera de servicio)</MenuItem>
                <MenuItem value="MEDIUM">MEDIUM (Falla parcial o recalibración)</MenuItem>
                <MenuItem value="LOW">LOW (Mantenimiento preventivo)</MenuItem>
              </TextField>

              <TextField
                label="Notas de Resolución / Seguimiento"
                placeholder="Anota el diagnóstico final o repuestos utilizados..."
                value={editForm.resolutionNotes}
                onChange={(e) => setEditForm({ ...editForm, resolutionNotes: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setEditingTicket(null)} color="inherit" sx={{ textTransform: 'none' }}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveEdit}
                sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, fontWeight: 'bold', textTransform: 'none' }}
              >
                Guardar Cambios
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>


      {/* ======================================================== */}
      {/* MODAL: CAMBIO RÁPIDO DE MODALIDAD, PRIORIDAD O ESTADO    */}
      {/* ======================================================== */}
      <Dialog
        open={Boolean(quickEditModal)}
        onClose={() => setQuickEditModal(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        {quickEditModal && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                {quickEditModal.field === 'serviceType'
                  ? 'Cambiar Modalidad de Atención'
                  : quickEditModal.field === 'priority'
                  ? 'Cambiar Nivel de Prioridad'
                  : 'Cambiar Estado de la Orden'}
              </span>
              <IconButton size="small" onClick={() => setQuickEditModal(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {quickEditModal.field === 'serviceType'
                  ? `Modifica si el reclamo #${quickEditModal.ticket.id} (${quickEditModal.ticket.customerName}) requiere visita física o atención remota por WhatsApp.`
                  : quickEditModal.field === 'priority'
                  ? `Ajusta el nivel de urgencia para el ticket #${quickEditModal.ticket.id}.`
                  : `Actualiza el estado de atención para el ticket #${quickEditModal.ticket.id}.`}
              </Typography>

              {quickEditModal.field === 'serviceType' && (
                <TextField
                  select
                  label="Modalidad de Servicio"
                  value={quickEditModal.selectedValue}
                  onChange={(e) =>
                    setQuickEditModal({ ...quickEditModal, selectedValue: e.target.value })
                  }
                  fullWidth
                >
                  <MenuItem value="ONSITE_PHYSICAL">🚗 Visita Técnica Presencial en Local</MenuItem>
                  <MenuItem value="REMOTE_WHATSAPP">💬 Atención Remota por WhatsApp</MenuItem>
                </TextField>
              )}

              {quickEditModal.field === 'priority' && (
                <TextField
                  select
                  label="Nivel de Prioridad"
                  value={quickEditModal.selectedValue}
                  onChange={(e) =>
                    setQuickEditModal({ ...quickEditModal, selectedValue: e.target.value })
                  }
                  fullWidth
                >
                  <MenuItem value="CRITICAL">CRITICAL (Riesgo / Detención crítica)</MenuItem>
                  <MenuItem value="HIGH">HIGH (Equipo fuera de servicio)</MenuItem>
                  <MenuItem value="MEDIUM">MEDIUM (Falla parcial o recalibración)</MenuItem>
                  <MenuItem value="LOW">LOW (Mantenimiento preventivo)</MenuItem>
                </TextField>
              )}

              {quickEditModal.field === 'status' && (
                <TextField
                  select
                  label="Estado de la Orden"
                  value={quickEditModal.selectedValue}
                  onChange={(e) =>
                    setQuickEditModal({ ...quickEditModal, selectedValue: e.target.value })
                  }
                  fullWidth
                >
                  <MenuItem value="OPEN">Pendiente (Sin iniciar)</MenuItem>
                  <MenuItem value="IN_PROGRESS">En Atención / En Progreso</MenuItem>
                  <MenuItem value="RESOLVED">Resuelto / Finalizado</MenuItem>
                </TextField>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setQuickEditModal(null)} color="inherit" sx={{ textTransform: 'none' }}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveQuickEdit}
                disabled={isSavingQuickEdit}
                sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, fontWeight: 'bold', textTransform: 'none' }}
              >
                {isSavingQuickEdit ? 'Guardando...' : 'Guardar Cambio'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar de Confirmación */}
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        message={notification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
