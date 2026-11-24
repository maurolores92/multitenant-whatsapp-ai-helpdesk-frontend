'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Snackbar,
} from '@mui/material';
import {
  SmartToy,
  Person,
  Send,
  Business,
  Place,
  Phone,
  PrecisionManufacturing,
  AssignmentTurnedIn,
  SupportAgent,
  CheckCircle,
  Warning,
  OpenInNew,
  Sync,
  Close as CloseIcon,
  ReceiptLong as ReceiptLongIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';

interface Message {
  id: string;
  senderType: 'CUSTOMER' | 'BOT' | 'AGENT' | 'SYSTEM';
  senderName: string;
  content: string;
  time: string;
}

interface TicketInfo {
  id: string;
  title: string;
  serviceType: 'ONSITE_PHYSICAL' | 'REMOTE_WHATSAPP';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  serviceOrderNumber?: string;
  aiDiagnostic: string;
}

interface EquipmentInfo {
  name: string;
  brandModel: string;
  serialNumber: string;
  lastMaintenance?: string;
  status: 'OPERATIONAL' | 'IN_INCIDENCE';
}

interface ConversationItem {
  id: string;
  customer: {
    name: string;
    company: string;
    phone: string;
    address: string;
    initials: string;
  };
  status: 'BOT_HANDLING' | 'WAITING_AGENT' | 'AGENT_HANDLING' | 'RESOLVED';
  assignedUser: {
    id: string;
    name: string;
    role: string;
  } | null;
  ticket: TicketInfo | null;
  equipments: EquipmentInfo[];
  messages: Message[];
  lastMessageTime: string;
  lastMessagePreview: string;
}

export default function ChatView() {
  const [currentUser, setCurrentUser] = useState({
    id: 'user-1',
    name: 'Admin HelpCopies',
    role: 'Administrador de Empresa',
  });

  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'info' | 'warning' } | null>(null);

  // Leer usuario autenticado desde localStorage si existe
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) {
          setCurrentUser({
            id: parsed.id || 'user-1',
            name: parsed.name,
            role: parsed.role === 'SUPER_ADMIN' ? 'Super Administrador' : parsed.role === 'ADMIN' ? 'Administrador de Empresa' : 'Técnico Especialista',
          });
        }
      }
    } catch {}
  }, []);

  const [conversations, setConversations] = useState<ConversationItem[]>([
    {
      id: 'conv-1',
      customer: {
        name: 'Roberto Gómez',
        company: 'Sanatorio San Lucas S.R.L.',
        phone: '+54 9 11 4444-2233',
        address: 'Av. Libertador 4200, Piso 3',
        initials: 'RG',
      },
      status: 'WAITING_AGENT',
      assignedUser: null,
      ticket: {
        id: 'TCK-1042',
        title: 'Incidencia WhatsApp: Error E-402 con sobrecalentamiento',
        serviceType: 'ONSITE_PHYSICAL',
        priority: 'HIGH',
        aiDiagnostic:
          'El cliente reportó olor a quemado y fallo tras error E-402. La IA determinó riesgo eléctrico y suspendió el encendido forzado. Se requiere técnico presencial en local con multímetro y reemplazo de fusible primario de 15A.',
      },
      equipments: [
        {
          name: 'Ecoflex 3000',
          brandModel: 'Sonix Med / ECO-3000',
          serialNumber: 'ECO-9923',
          lastMaintenance: '15/09/2026 (Preventivo)',
          status: 'IN_INCIDENCE',
        },
        {
          name: 'Monitor Multiparamétrico MP-50',
          brandModel: 'Philips / MP-50',
          serialNumber: 'PH-8812',
          status: 'OPERATIONAL',
        },
      ],
      messages: [
        {
          id: 'm1',
          senderType: 'CUSTOMER',
          senderName: 'Roberto Gómez (Cliente)',
          content: 'Hola, el equipo de ecografía Ecoflex 3000 tiró un error E-402 y no enciende la pantalla.',
          time: '14:02',
        },
        {
          id: 'm2',
          senderType: 'BOT',
          senderName: 'Asistente IA Oficial',
          content:
            '¡Hola Roberto! He identificado tu equipo registrado: Ecoflex 3000 (S/N: ECO-9923). El error E-402 indica una anomalía en la etapa de potencia. ¿Podrías confirmar si la llave térmica posterior está activa y si hay luces en el panel frontal?',
          time: '14:02',
        },
        {
          id: 'm3',
          senderType: 'CUSTOMER',
          senderName: 'Roberto Gómez (Cliente)',
          content: 'Revisé la llave térmica y está bien. Pero no hay luces y se percibe un ligero olor a componente caliente.',
          time: '14:05',
        },
        {
          id: 'm4',
          senderType: 'BOT',
          senderName: 'Asistente IA Oficial',
          content:
            'Entendido. Dado el riesgo eléctrico y olor a sobrecalentamiento, he suspendido el encendido forzado y escalé el caso con prioridad ALTA. Determinación: Requiere Técnico Físico en Local. Ya transferí la conversación a nuestro equipo técnico.',
          time: '14:06',
        },
      ],
      lastMessageTime: '14:06',
      lastMessagePreview: 'Determinación: Requiere Técnico Físico en Local...',
    },
    {
      id: 'conv-2',
      customer: {
        name: 'Mariana Costa',
        company: 'Laboratorio BioTest',
        phone: '+54 9 11 3333-8899',
        address: 'Calle 50 N° 1234, La Plata',
        initials: 'MC',
      },
      status: 'BOT_HANDLING',
      assignedUser: null,
      ticket: {
        id: 'TCK-1041',
        title: 'Incidencia WhatsApp: Calibración desajustada en panel',
        serviceType: 'REMOTE_WHATSAPP',
        priority: 'MEDIUM',
        aiDiagnostic:
          'Lectura de RPM desfasada en pantalla digital. No hay daño mecánico evidente. La IA determinó asistencia remota vía WhatsApp para guiar combinación de botones de reseteo de fábrica.',
      },
      equipments: [
        {
          name: 'Centrifugadora C-20',
          brandModel: 'BioLab / C-20',
          serialNumber: 'CEN-4412',
          status: 'IN_INCIDENCE',
        },
      ],
      messages: [
        {
          id: 'm201',
          senderType: 'CUSTOMER',
          senderName: 'Mariana Costa (Cliente)',
          content: 'Hola, la centrifugadora C-20 está mostrando un valor erróneo de RPM al iniciar el ciclo.',
          time: '13:45',
        },
        {
          id: 'm202',
          senderType: 'BOT',
          senderName: 'Asistente IA Oficial',
          content:
            'Hola Mariana, soy el asistente técnico de HelpCopies SRL. El modelo C-20 puede requerir un recalibrado de sensor óptico. ¿El tambor gira a velocidad constante o sientes vibración?',
          time: '13:46',
        },
        {
          id: 'm203',
          senderType: 'CUSTOMER',
          senderName: 'Mariana Costa (Cliente)',
          content: 'Gira bien sin vibración, solo es la lectura en pantalla.',
          time: '13:48',
        },
        {
          id: 'm204',
          senderType: 'BOT',
          senderName: 'Asistente IA Oficial',
          content:
            'Comprendido. Procedimiento de reinicio: mantén presionados "Stop" + "Set" durante 5 segundos hasta escuchar el bip de calibración.',
          time: '13:49',
        },
      ],
      lastMessageTime: '13:49',
      lastMessagePreview: 'Procedimiento de reinicio: mantén presionados "Stop" + "Set"...',
    },
    {
      id: 'conv-3',
      customer: {
        name: 'Dr. Varela',
        company: 'Clínica Las Palmeras',
        phone: '+54 9 11 2222-1144',
        address: 'Av. Belgrano 850, CABA',
        initials: 'DV',
      },
      status: 'AGENT_HANDLING',
      assignedUser: {
        id: 'user-1',
        name: 'Admin HelpCopies',
        role: 'Administrador de Empresa',
      },
      ticket: null,
      equipments: [
        {
          name: 'Monitor Multiparamétrico MP-50',
          brandModel: 'Philips / MP-50',
          serialNumber: 'PH-8812',
          status: 'OPERATIONAL',
        },
      ],
      messages: [
        {
          id: 'm301',
          senderType: 'CUSTOMER',
          senderName: 'Dr. Varela (Cliente)',
          content: 'Buen día, tenemos una consulta sobre el sensor del monitor.',
          time: '11:30',
        },
        {
          id: 'm302',
          senderType: 'BOT',
          senderName: 'Asistente IA Oficial',
          content: '¡Buen día Dr. Varela! ¿En qué podemos ayudarle con el equipo MP-50?',
          time: '11:30',
        },
        {
          id: 'm303',
          senderType: 'SYSTEM',
          senderName: 'Sistema',
          content: '👤 Admin HelpCopies tomó el control de la conversación.',
          time: '11:32',
        },
        {
          id: 'm304',
          senderType: 'AGENT',
          senderName: 'Admin HelpCopies (Administrador de Empresa)',
          content: 'Hola Dr. Varela, aquí el soporte técnico. ¿El sensor es el de saturación o ECG?',
          time: '11:33',
        },
        {
          id: 'm305',
          senderType: 'CUSTOMER',
          senderName: 'Dr. Varela (Cliente)',
          content: 'Es el de saturación, ya lo solucionamos conectándolo al puerto secundario. Muchas gracias!',
          time: '11:35',
        },
      ],
      lastMessageTime: '11:35',
      lastMessagePreview: 'Es el de saturación, ya lo solucionamos...',
    },
  ]);

  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  const [inputMessage, setInputMessage] = useState('');
  const [openCreateTicketDialog, setOpenCreateTicketDialog] = useState(false);
  const [ticketForm, setTicketForm] = useState<{
    serviceType: 'ONSITE_PHYSICAL' | 'REMOTE_WHATSAPP';
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    notes: string;
  }>({
    serviceType: 'ONSITE_PHYSICAL',
    priority: 'HIGH',
    notes: '',
  });

  // Modal: Notificar Orden de Servicio por WhatsApp
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [serviceOrderInput, setServiceOrderInput] = useState('');
  const [whatsappMessageInput, setWhatsappMessageInput] = useState('');
  const [isSendingOrder, setIsSendingOrder] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // ========================================================
  // ACCIÓN 1: TOMAR CONVERSACIÓN (HUMAN TAKEOVER)
  // ========================================================
  const handleTakeOver = async () => {
    if (!activeConv) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl && token) {
        await fetch(`${apiUrl}/chat/conversations/${activeConv.id}/take-over`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch {}

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const systemMsg: Message = {
      id: `sys-${Date.now()}`,
      senderType: 'SYSTEM',
      senderName: 'Sistema',
      content: `👤 ${currentUser.name} tomó la conversación. La IA se ha silenciado para este chat.`,
      time: now,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              status: 'AGENT_HANDLING',
              assignedUser: currentUser,
              messages: [...c.messages, systemMsg],
            }
          : c
      )
    );

    setNotification({
      message: 'Has tomado la conversación. Ahora estás en control directo del chat y la IA ha pausado sus respuestas automáticas.',
      severity: 'success',
    });
  };

  // ========================================================
  // ACCIÓN 2: DEVOLVER A IA (RELEASE TO BOT)
  // ========================================================
  const handleReleaseToBot = async () => {
    if (!activeConv) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl && token) {
        await fetch(`${apiUrl}/chat/conversations/${activeConv.id}/release-to-bot`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch {}

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const systemMsg: Message = {
      id: `sys-${Date.now()}`,
      senderType: 'SYSTEM',
      senderName: 'Sistema',
      content: '🤖 La conversación fue devuelta a la IA. El bot responderá autónomamente al cliente en el próximo mensaje.',
      time: now,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              status: 'BOT_HANDLING',
              assignedUser: null,
              messages: [...c.messages, systemMsg],
            }
          : c
      )
    );

    setNotification({
      message: 'Conversación devuelta a la IA. El asistente virtual responderá al próximo mensaje según las reglas y conocimientos de la empresa.',
      severity: 'info',
    });
  };

  // ========================================================
  // ENVIAR MENSAJE COMO AGENTE / TÉCNICO
  // ========================================================
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeConv) return;

    const text = inputMessage.trim();
    setInputMessage('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Si la conversación estaba en manos de la IA, enviar mensaje como operador asume el control
    const wasBotHandling = activeConv.status === 'BOT_HANDLING' || activeConv.status === 'WAITING_AGENT';

    const newAgentMsg: Message = {
      id: `agent-${Date.now()}`,
      senderType: 'AGENT',
      senderName: `${currentUser.name} (${currentUser.role})`,
      content: text,
      time: now,
    };

    const newMessages = [...activeConv.messages];
    if (wasBotHandling) {
      newMessages.push({
        id: `sys-${Date.now()}`,
        senderType: 'SYSTEM',
        senderName: 'Sistema',
        content: `👤 ${currentUser.name} intervino y tomó el control de la conversación.`,
        time: now,
      });
    }
    newMessages.push(newAgentMsg);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              status: 'AGENT_HANDLING',
              assignedUser: currentUser,
              messages: newMessages,
              lastMessageTime: now,
              lastMessagePreview: text,
            }
          : c
      )
    );

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl && token) {
        await fetch(`${apiUrl}/chat/conversations/${activeConv.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: text }),
        }).catch(() => {});
      }
    } catch {}
  };

  // ========================================================
  // CREAR TICKET MANUAL DESDE EL CHAT
  // ========================================================
  const handleCreateTicket = () => {
    if (!activeConv) return;

    const newTicket: TicketInfo = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Incidencia WhatsApp: Derivado por ${currentUser.name}`,
      serviceType: ticketForm.serviceType,
      priority: ticketForm.priority,
      aiDiagnostic: ticketForm.notes.trim() || 'Ticket generado manualmente desde la consola de chat por el operador.',
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConv.id ? { ...c, ticket: newTicket } : c))
    );

    setOpenCreateTicketDialog(false);
    setTicketForm({ serviceType: 'ONSITE_PHYSICAL', priority: 'HIGH', notes: '' });
    setNotification({
      message: `¡Ticket #${newTicket.id} creado exitosamente! Puedes consultarlo y gestionarlo en la vista de Tickets.`,
      severity: 'success',
    });
  };

  // ========================================================
  // NOTIFICAR ORDEN DE SERVICIO A WHATSAPP
  // ========================================================
  const buildDefaultWhatsAppMessage = (customerName: string, equipmentName: string, equipmentSn: string, orderNum: string) => {
    const orderText = orderNum.trim() || '######';
    return `Estimado/a ${customerName}, le informamos que se ha generado la *Orden de Servicio N° ${orderText}* para la atención técnica de su reclamo sobre el equipo *${equipmentName}* (S/N: ${equipmentSn}). Nuestro equipo técnico ya se encuentra gestionando su solicitud con la máxima prioridad. Muchas gracias por confiar en HelpCopies SRL.`;
  };

  const handleOpenOrderModal = () => {
    if (!activeConv) return;
    const existingOrder = activeConv.ticket?.serviceOrderNumber || '';
    setServiceOrderInput(existingOrder);
    setWhatsappMessageInput(
      buildDefaultWhatsAppMessage(
        activeConv.customer.name,
        activeConv.equipments[0]?.name || 'Equipo General',
        activeConv.equipments[0]?.serialNumber || 'S/N',
        existingOrder
      )
    );
    setOpenOrderModal(true);
  };

  const handleOrderNumberChange = (newOrder: string) => {
    setServiceOrderInput(newOrder);
    if (activeConv) {
      setWhatsappMessageInput(
        buildDefaultWhatsAppMessage(
          activeConv.customer.name,
          activeConv.equipments[0]?.name || 'Equipo General',
          activeConv.equipments[0]?.serialNumber || 'S/N',
          newOrder
        )
      );
    }
  };

  const handleSendOrderToWhatsApp = async () => {
    if (!activeConv || !serviceOrderInput.trim()) return;
    setIsSendingOrder(true);
    const orderNum = serviceOrderInput.trim();
    const text = whatsappMessageInput.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: `os-${Date.now()}`,
      senderType: 'AGENT',
      senderName: `${currentUser.name} (${currentUser.role})`,
      content: text,
      time: now,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              status: 'AGENT_HANDLING',
              assignedUser: currentUser,
              ticket: c.ticket
                ? { ...c.ticket, serviceOrderNumber: orderNum }
                : {
                    id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
                    title: `Orden de Servicio N° ${orderNum}`,
                    serviceType: 'ONSITE_PHYSICAL',
                    priority: 'HIGH',
                    serviceOrderNumber: orderNum,
                    aiDiagnostic: `Orden de servicio generada y notificada por ${currentUser.name}`,
                  },
              messages: [...c.messages, newMsg],
              lastMessageTime: now,
              lastMessagePreview: text,
            }
          : c
      )
    );

    if (activeConv.ticket?.id) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl && token) {
          await fetch(`${apiUrl}/tickets/${activeConv.ticket.id}/notify-service-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              serviceOrderNumber: orderNum,
              customMessage: text,
            }),
          }).catch(() => {});
        }
      } catch {}
    }

    setIsSendingOrder(false);
    setOpenOrderModal(false);
    setNotification({
      message: `¡Orden de Servicio N° ${orderNum} generada y notificada a WhatsApp!`,
      severity: 'success',
    });
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '300px 1fr 360px' },
        gap: 2,
        height: 'calc(100vh - 120px)',
      }}
    >
      {/* ======================================================== */}
      {/* COLUMNA IZQUIERDA: LISTA DE CONVERSACIONES               */}
      {/* ======================================================== */}
      <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
              Bandeja de Entrada
            </Typography>
            <Tooltip title="Actualizar conversaciones" arrow>
              <IconButton size="small">
                <Sync fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Meta WhatsApp Cloud API Oficial
          </Typography>
        </Box>

        <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
          {conversations.map((conv) => {
            const isSelected = conv.id === activeConv?.id;
            const isBot = conv.status === 'BOT_HANDLING';
            const isWaiting = conv.status === 'WAITING_AGENT';
            const isAgent = conv.status === 'AGENT_HANDLING';

            return (
              <React.Fragment key={conv.id}>
                <ListItem
                  alignItems="flex-start"
                  onClick={() => setSelectedConvId(conv.id)}
                  sx={{
                    bgcolor: isSelected ? '#f0fdf4' : 'transparent',
                    borderLeft: isSelected ? '4px solid #128C7E' : '4px solid transparent',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: isSelected ? '#f0fdf4' : '#f8fafc' },
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: isSelected ? '#128C7E' : '#0284c7', fontWeight: 'bold' }}>
                      {conv.customer.initials}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: isSelected ? 'bold' : 600, color: '#0f172a' }}>
                          {conv.customer.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                          {conv.lastMessageTime}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {conv.customer.company}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          {isBot && (
                            <Chip
                              size="small"
                              icon={<SmartToy sx={{ fontSize: '0.8rem !important' }} />}
                              label="IA Activa"
                              color="info"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                            />
                          )}
                          {isWaiting && (
                            <Chip
                              size="small"
                              icon={<Warning sx={{ fontSize: '0.8rem !important' }} />}
                              label="Requiere Técnico"
                              color="warning"
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }}
                            />
                          )}
                          {isAgent && (
                            <Chip
                              size="small"
                              icon={<Person sx={{ fontSize: '0.8rem !important' }} />}
                              label={conv.assignedUser?.name ? `Atiende: ${conv.assignedUser.name.split(' ')[0]}` : 'Humano'}
                              color="success"
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      </Paper>

      {/* ======================================================== */}
      {/* COLUMNA CENTRAL: CHAT EN VIVO Y CONTROL HUMANO/IA        */}
      {/* ======================================================== */}
      <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
        {/* Encabezado del Chat */}
        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                {activeConv.customer.name} ({activeConv.customer.company})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeConv.customer.phone} • {activeConv.equipments[0]?.name || 'Equipo no especificado'}
              </Typography>
            </Box>

            {/* BOTONERA: TOMAR CONVERSACIÓN / DEVOLVER A IA */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {activeConv.status === 'AGENT_HANDLING' ? (
                <>
                  <Chip
                    icon={<Person sx={{ fontSize: '1rem !important' }} />}
                    label={`Atendido por: ${activeConv.assignedUser?.name || currentUser.name}`}
                    color="success"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Tooltip title="Silencia tu control y reactiva las respuestas automáticas de la IA para este cliente" arrow placement="top">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<SmartToy />}
                      onClick={handleReleaseToBot}
                      sx={{
                        color: '#7c3aed',
                        borderColor: '#7c3aed',
                        '&:hover': { bgcolor: '#f5f3ff', borderColor: '#6d28d9' },
                        textTransform: 'none',
                        fontWeight: 'bold',
                      }}
                    >
                      🤖 Devolver a IA
                    </Button>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Chip
                    icon={<SmartToy sx={{ fontSize: '1rem !important' }} />}
                    label={activeConv.status === 'WAITING_AGENT' ? 'Requiere Atención Técnica' : 'IA Respondiendo en Vivo'}
                    color={activeConv.status === 'WAITING_AGENT' ? 'warning' : 'info'}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Tooltip title="Pausa la IA y toma el control directo de la conversación para responder como operador" arrow placement="top">
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<SupportAgent />}
                      onClick={handleTakeOver}
                      sx={{
                        bgcolor: '#059669',
                        '&:hover': { bgcolor: '#047857' },
                        color: '#ffffff',
                        textTransform: 'none',
                        fontWeight: 'bold',
                      }}
                    >
                      👤 Tomar Conversación
                    </Button>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Área de Mensajes */}
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#efeae2' }}>
          <Stack spacing={1.5}>
            {activeConv.messages.map((msg) => {
              const isCustomer = msg.senderType === 'CUSTOMER';
              const isBot = msg.senderType === 'BOT';
              const isAgent = msg.senderType === 'AGENT';
              const isSystem = msg.senderType === 'SYSTEM';

              if (isSystem) {
                return (
                  <Box key={msg.id} sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                    <Chip
                      size="small"
                      label={`${msg.content} • ${msg.time}`}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        color: '#64748b',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  </Box>
                );
              }

              return (
                <Box
                  key={msg.id}
                  sx={{
                    alignSelf: isCustomer ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isCustomer ? '#ffffff' : isBot ? '#e0f2fe' : '#d9fdd3',
                      borderLeft: isBot
                        ? '4px solid #0284c7'
                        : isAgent
                        ? '4px solid #128C7E'
                        : undefined,
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                      {isBot && <SmartToy sx={{ fontSize: 16, color: '#0284c7' }} />}
                      {isAgent && <Person sx={{ fontSize: 16, color: '#128C7E' }} />}
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 'bold',
                          color: isCustomer ? '#0f172a' : isBot ? '#0369a1' : '#075E54',
                        }}
                      >
                        {msg.senderName}
                      </Typography>
                    </Stack>

                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#1e293b' }}>
                      {msg.content}
                    </Typography>

                    <Box sx={{ textAlign: 'right', mt: 0.5 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#64748b' }}>
                        {msg.time}
                        {isAgent && ' • Registrado con firma de operador'}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>

        {/* Barra de Entrada / Chat Input */}
        <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
          {activeConv.status === 'BOT_HANDLING' ? (
            <Alert severity="info" sx={{ py: 0, px: 1.5, mb: 1, fontSize: '0.75rem', alignItems: 'center' }}>
              <span>
                🤖 <strong>La IA está respondiendo automáticamente.</strong> Si escribes un mensaje, el sistema te asignará el control del chat y pausará al bot.
              </span>
            </Alert>
          ) : (
            <Alert severity="success" sx={{ py: 0, px: 1.5, mb: 1, fontSize: '0.75rem' }}>
              <span>
                👤 Estás en control del chat. Tu mensaje se enviará por Meta WhatsApp Cloud API firmado a nombre de: <strong>{currentUser.name}</strong>
              </span>
            </Alert>
          )}

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder={
                activeConv.status === 'BOT_HANDLING'
                  ? 'Escribe para intervenir y responder como operador humano...'
                  : 'Escribe tu respuesta técnica oficial por WhatsApp...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              endIcon={<Send />}
              sx={{
                bgcolor: '#128C7E',
                '&:hover': { bgcolor: '#075E54' },
                fontWeight: 'bold',
                textTransform: 'none',
                px: 2.5,
              }}
            >
              Enviar
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* ======================================================== */}
      {/* COLUMNA DERECHA: ESTADO, TICKETS Y FICHA DE EQUIPOS      */}
      {/* ======================================================== */}
      <Box sx={{ height: '100%', overflowY: 'auto' }}>
        <Stack spacing={2}>
          {/* TARJETA 1: TICKET ASOCIADO / DICTAMEN DE LA IA */}
          <Card sx={{ borderRadius: 2, border: '1px solid #fed7aa' }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <SmartToy sx={{ color: '#ea580c' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#9a3412' }}>
                    Dictamen & Ticket de Servicio
                  </Typography>
                </Stack>
                {activeConv.ticket && (
                  <Chip
                    label={`#${activeConv.ticket.id}`}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 'bold', height: 22 }}
                  />
                )}
              </Box>

              {activeConv.ticket ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {activeConv.ticket.title}
                  </Typography>

                  <Box sx={{ bgcolor: '#fff7ed', p: 1.5, borderRadius: 1.5, mb: 1.5, borderLeft: '4px solid #ea580c' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#9a3412', display: 'block' }}>
                      Diagnóstico Formulado por la IA:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1e293b', mt: 0.5 }}>
                      {activeConv.ticket.aiDiagnostic}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        color={activeConv.ticket.serviceType === 'ONSITE_PHYSICAL' ? 'error' : 'info'}
                        label={
                          activeConv.ticket.serviceType === 'ONSITE_PHYSICAL'
                            ? '🚗 Visita Técnica Presencial'
                            : '💬 Atención Remota WhatsApp'
                        }
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Prioridad: ${activeConv.ticket.priority}`}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    component={Link}
                    href="/tickets"
                    variant="contained"
                    startIcon={<AssignmentTurnedIn />}
                    endIcon={<OpenInNew fontSize="small" />}
                    sx={{
                      bgcolor: '#0284c7',
                      '&:hover': { bgcolor: '#0369a1' },
                      textTransform: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    Ver en Órdenes & Tickets
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Esta conversación aún no tiene una orden de servicio o ticket escalado.
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AssignmentTurnedIn />}
                    onClick={() => setOpenCreateTicketDialog(true)}
                    sx={{
                      borderColor: '#0284c7',
                      color: '#0284c7',
                      textTransform: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    + Derivar a Ticket de Servicio
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* TARJETA 2: FICHA DEL CLIENTE */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#0f172a' }}>
                Datos de la Empresa / Cliente
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Contacto:</strong> {activeConv.customer.name}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Business sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Razón Social:</strong> {activeConv.customer.company}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>WhatsApp:</strong> {activeConv.customer.phone}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Place sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Dirección:</strong> {activeConv.customer.address}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* TARJETA 3: EQUIPOS REGISTRADOS DEL CLIENTE (SIN BOTÓN NUEVO EQUIPO) */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#0f172a' }}>
                Equipos Registrados ({activeConv.equipments.length})
              </Typography>

              <Stack spacing={1.5}>
                {activeConv.equipments.map((eq, index) => {
                  const isInIncidence = eq.status === 'IN_INCIDENCE';
                  return (
                    <Box
                      key={index}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: isInIncidence ? '2px solid #128C7E' : '1px solid #e2e8f0',
                        bgcolor: isInIncidence ? '#f0fdf4' : '#ffffff',
                      }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <PrecisionManufacturing sx={{ color: isInIncidence ? '#128C7E' : 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: isInIncidence ? '#075E54' : '#0f172a' }}>
                          {eq.name} {isInIncidence && '(En Incidencia)'}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        <strong>Marca / Modelo:</strong> {eq.brandModel}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        <strong>N° Serie:</strong> {eq.serialNumber}
                      </Typography>
                      {eq.lastMaintenance && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          <strong>Último Mantenimiento:</strong> {eq.lastMaintenance}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* ======================================================== */}
      {/* MODAL: DERIVAR A TICKET DE SERVICIO                      */}
      {/* ======================================================== */}
      <Dialog
        open={openCreateTicketDialog}
        onClose={() => setOpenCreateTicketDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Derivar a Ticket de Servicio</span>
          <IconButton size="small" onClick={() => setOpenCreateTicketDialog(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Escala esta conversación a una orden formal de servicio técnico para que el equipo lo atienda en la bandeja de Tickets.
          </Typography>

          <TextField
            select
            label="Tipo de Asistencia"
            value={ticketForm.serviceType}
            onChange={(e) => setTicketForm({ ...ticketForm, serviceType: e.target.value as any })}
            fullWidth
          >
            <MenuItem value="ONSITE_PHYSICAL">🚗 Visita Técnica Presencial en Local</MenuItem>
            <MenuItem value="REMOTE_WHATSAPP">💬 Atención Técnica Especializada WhatsApp</MenuItem>
          </TextField>

          <TextField
            select
            label="Prioridad"
            value={ticketForm.priority}
            onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as any })}
            fullWidth
          >
            <MenuItem value="CRITICAL">Crítica (Riesgo / Detención de producción)</MenuItem>
            <MenuItem value="HIGH">Alta (Equipo fuera de servicio)</MenuItem>
            <MenuItem value="MEDIUM">Media (Falla parcial o calibración)</MenuItem>
            <MenuItem value="LOW">Baja (Mantenimiento preventivo)</MenuItem>
          </TextField>

          <TextField
            label="Diagnóstico o Motivo de Escalación"
            placeholder="Describe brevemente la falla detectada o el procedimiento a seguir..."
            value={ticketForm.notes}
            onChange={(e) => setTicketForm({ ...ticketForm, notes: e.target.value })}
            multiline
            rows={3}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenCreateTicketDialog(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTicket}
            sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, fontWeight: 'bold' }}
          >
            Abrir Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificaciones Snackbar */}
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        message={notification?.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
