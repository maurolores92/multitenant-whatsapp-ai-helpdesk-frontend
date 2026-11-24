'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  InputAdornment,
  Switch,
  FormControlLabel,
  Slider,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  WhatsApp as WhatsAppIcon,
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Key as KeyIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  SmartToy as SmartToyIcon,
  Psychology as PsychologyIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Tune as TuneIcon,
  MenuBook as MenuBookIcon,
  Rule as RuleIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';

interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  whatsappPhone?: string;
  whatsappPhoneNumberId?: string;
  whatsappWabaId?: string;
  whatsappAccessToken?: string;
  whatsappStatus: string;
  geminiApiKey?: string;
  geminiModel?: string;
  aiTemperature?: number;
  aiSystemPrompt?: string;
  aiEnabled?: boolean;
  createdAt: string;
  _count: {
    users: number;
    customers: number;
    tickets: number;
    conversations: number;
    aiRules?: number;
    aiKnowledgeItems?: number;
  };
  users: TenantUser[];
}

interface AiRuleItem {
  id: string;
  tenantId: string;
  title: string;
  instruction: string;
  category: 'TONE' | 'RESTRICTION' | 'BUSINESS' | 'ESCALATION';
  priority: number;
  isActive: boolean;
}

interface AiKnowledgeItem {
  id: string;
  tenantId: string;
  question: string;
  answer: string;
  tags: string[];
  isActive: boolean;
}

export default function CompaniesView() {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal: Crear Nueva Compañía
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    whatsappPhone: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [isSubmittingTenant, setIsSubmittingTenant] = useState(false);

  // Modal: Detalle y Configuración de Compañía (Tabs)
  const [detailTenant, setDetailTenant] = useState<TenantItem | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Formulario WhatsApp Config
  const [whatsappForm, setWhatsappForm] = useState({
    whatsappPhoneNumberId: '',
    whatsappWabaId: '',
    whatsappAccessToken: '',
    whatsappPhone: '',
  });
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);

  // Formulario Crear Usuario dentro de Compañía
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Modal: Editar Usuario dentro de Compañía
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<TenantUser | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });
  const [isSubmittingEditUser, setIsSubmittingEditUser] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);

  // Tab 2: Inteligencia Artificial & Entrenamiento (Exclusivo Superadmin)
  const [aiSubTab, setAiSubTab] = useState(0);
  const [aiConfigForm, setAiConfigForm] = useState({
    geminiApiKey: '',
    geminiModel: 'gemini-2.0-flash',
    aiTemperature: 0.2,
    aiSystemPrompt: '',
    aiEnabled: true,
    hasCustomApiKey: false,
    maskedApiKey: '',
  });
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false);
  const [isSavingAiConfig, setIsSavingAiConfig] = useState(false);

  // Reglas de Comportamiento
  const [aiRules, setAiRules] = useState<AiRuleItem[]>([]);
  const [isLoadingAiRules, setIsLoadingAiRules] = useState(false);
  const [openRuleDialog, setOpenRuleDialog] = useState(false);
  const [ruleForm, setRuleForm] = useState<{
    id?: string;
    title: string;
    instruction: string;
    category: 'TONE' | 'RESTRICTION' | 'BUSINESS' | 'ESCALATION';
    priority: number;
  }>({
    title: '',
    instruction: '',
    category: 'BUSINESS',
    priority: 1,
  });
  const [isSavingRule, setIsSavingRule] = useState(false);

  // Base de Conocimientos (FAQs)
  const [aiKnowledge, setAiKnowledge] = useState<AiKnowledgeItem[]>([]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const [openKnowledgeDialog, setOpenKnowledgeDialog] = useState(false);
  const [knowledgeForm, setKnowledgeForm] = useState<{
    id?: string;
    question: string;
    answer: string;
    tags: string;
  }>({
    question: '',
    answer: '',
    tags: '',
  });
  const [isSavingKnowledge, setIsSavingKnowledge] = useState(false);

  // Simulador / Playground
  const [simulatorInput, setSimulatorInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState<
    Array<{
      sender: 'user' | 'bot';
      text: string;
      meta?: {
        modelUsed?: string;
        rulesCount?: number;
        executionTimeMs?: number;
        isLiveAi?: boolean;
      };
    }>
  >([]);

  const fetchTenants = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('Variable NEXT_PUBLIC_API_URL no configurada');

      const res = await fetch(`${apiUrl}/tenants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al cargar compañías');
      }

      const data = await res.json();
      setTenants(data);

      // Si hay una compañía seleccionada en detalle, actualizar sus datos locales
      if (detailTenant) {
        const updated = data.find((t: TenantItem) => t.id === detailTenant.id);
        if (updated) {
          setDetailTenant(updated);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al obtener la lista de compañías');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchAiData = async (tenantId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      setIsLoadingAiRules(true);
      setIsLoadingKnowledge(true);

      const [configRes, rulesRes, kbRes] = await Promise.all([
        fetch(`${apiUrl}/tenants/${tenantId}/ai-training/config`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/tenants/${tenantId}/ai-training/rules`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/tenants/${tenantId}/ai-training/knowledge`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (configRes.ok) {
        const configData = await configRes.json();
        setAiConfigForm({
          geminiApiKey: '',
          geminiModel: configData.geminiModel || 'gemini-2.0-flash',
          aiTemperature: configData.aiTemperature ?? 0.2,
          aiSystemPrompt: configData.aiSystemPrompt || '',
          aiEnabled: configData.aiEnabled ?? true,
          hasCustomApiKey: Boolean(configData.hasCustomApiKey),
          maskedApiKey: configData.maskedApiKey || '',
        });
      }

      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setAiRules(rulesData);
      }

      if (kbRes.ok) {
        const kbData = await kbRes.json();
        setAiKnowledge(kbData);
      }
    } catch {
      // Manejo silencioso en carga inicial de IA
    } finally {
      setIsLoadingAiRules(false);
      setIsLoadingKnowledge(false);
    }
  };

  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailTenant) return;
    setIsSavingAiConfig(true);
    setErrorMessage(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('Variable NEXT_PUBLIC_API_URL no configurada');

      const bodyData: any = {
        geminiModel: aiConfigForm.geminiModel,
        aiTemperature: aiConfigForm.aiTemperature,
        aiSystemPrompt: aiConfigForm.aiSystemPrompt,
        aiEnabled: aiConfigForm.aiEnabled,
      };
      if (aiConfigForm.geminiApiKey.trim()) {
        bodyData.geminiApiKey = aiConfigForm.geminiApiKey.trim();
      }

      const res = await fetch(`${apiUrl}/tenants/${detailTenant.id}/ai-training/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar configuración de IA');

      setAiConfigForm((prev) => ({
        ...prev,
        geminiApiKey: '',
        hasCustomApiKey: Boolean(data.hasCustomApiKey),
        maskedApiKey: data.maskedApiKey || '',
      }));
      setSuccessMessage('Configuración de IA actualizada exitosamente');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar configuración de IA');
    } finally {
      setIsSavingAiConfig(false);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailTenant) return;
    setIsSavingRule(true);
    setErrorMessage(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('Variable NEXT_PUBLIC_API_URL no configurada');

      const isEdit = Boolean(ruleForm.id);
      const url = isEdit
        ? `${apiUrl}/tenants/${detailTenant.id}/ai-training/rules/${ruleForm.id}`
        : `${apiUrl}/tenants/${detailTenant.id}/ai-training/rules`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: ruleForm.title,
          instruction: ruleForm.instruction,
          category: ruleForm.category,
          priority: Number(ruleForm.priority),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar regla');

      if (isEdit) {
        setAiRules((prev) => prev.map((r) => (r.id === data.id ? data : r)));
        setSuccessMessage('Regla actualizada exitosamente');
      } else {
        setAiRules((prev) => [...prev, data]);
        setSuccessMessage('Regla creada exitosamente');
      }

      setOpenRuleDialog(false);
      setRuleForm({ title: '', instruction: '', category: 'BUSINESS', priority: 1 });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar regla');
    } finally {
      setIsSavingRule(false);
    }
  };

  const handleToggleRule = async (rule: AiRuleItem) => {
    if (!detailTenant) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      const res = await fetch(`${apiUrl}/tenants/${detailTenant.id}/ai-training/rules/${rule.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAiRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      }
    } catch {}
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!detailTenant) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      const res = await fetch(`${apiUrl}/tenants/${detailTenant.id}/ai-training/rules/${ruleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAiRules((prev) => prev.filter((r) => r.id !== ruleId));
        setSuccessMessage('Regla eliminada exitosamente');
      }
    } catch {}
  };

  const handleSaveKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailTenant) return;
    setIsSavingKnowledge(true);
    setErrorMessage(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('Variable NEXT_PUBLIC_API_URL no configurada');

      const isEdit = Boolean(knowledgeForm.id);
      const url = isEdit
        ? `${apiUrl}/tenants/${detailTenant.id}/ai-training/knowledge/${knowledgeForm.id}`
        : `${apiUrl}/tenants/${detailTenant.id}/ai-training/knowledge`;
      const method = isEdit ? 'PATCH' : 'POST';

      const tagsArray = knowledgeForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: knowledgeForm.question,
          answer: knowledgeForm.answer,
          tags: tagsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar ítem de conocimiento');

      if (isEdit) {
        setAiKnowledge((prev) => prev.map((k) => (k.id === data.id ? data : k)));
        setSuccessMessage('Conocimiento actualizado exitosamente');
      } else {
        setAiKnowledge((prev) => [data, ...prev]);
        setSuccessMessage('Conocimiento agregado exitosamente');
      }

      setOpenKnowledgeDialog(false);
      setKnowledgeForm({ question: '', answer: '', tags: '' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar ítem de conocimiento');
    } finally {
      setIsSavingKnowledge(false);
    }
  };

  const handleToggleKnowledge = async (item: AiKnowledgeItem) => {
    if (!detailTenant) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      const res = await fetch(`${apiUrl}/tenants/${detailTenant.id}/ai-training/knowledge/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAiKnowledge((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
      }
    } catch {}
  };

  const handleDeleteKnowledge = async (itemId: string) => {
    if (!detailTenant) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      const res = await fetch(`${apiUrl}/tenants/${detailTenant.id}/ai-training/knowledge/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAiKnowledge((prev) => prev.filter((k) => k.id !== itemId));
        setSuccessMessage('Ítem de conocimiento eliminado exitosamente');
      }
    } catch {}
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailTenant || !simulatorInput.trim()) return;
    const msg = simulatorInput.trim();
    setSimulatorInput('');
    setIsSimulating(true);

    setSimulationHistory((prev) => [...prev, { sender: 'user', text: msg }]);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('Variable NEXT_PUBLIC_API_URL no configurada');

      const res = await fetch(`${apiUrl}/tenants/${detailTenant.id}/ai-training/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: msg }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error en la simulación');

      setSimulationHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: data.response,
          meta: {
            modelUsed: data.modelUsed,
            rulesCount: data.rulesCount,
            executionTimeMs: data.executionTimeMs,
            isLiveAi: data.isLiveAi,
          },
        },
      ]);
    } catch (err: any) {
      setSimulationHistory((prev) => [
        ...prev,
        { sender: 'bot', text: `[Error de Simulación]: ${err.message}` },
      ]);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleOpenDetail = (tenant: TenantItem, initialTab = 0) => {
    setDetailTenant(tenant);
    setActiveTab(initialTab);
    setWhatsappForm({
      whatsappPhoneNumberId: tenant.whatsappPhoneNumberId || '',
      whatsappWabaId: tenant.whatsappWabaId || '',
      whatsappAccessToken: tenant.whatsappAccessToken || '',
      whatsappPhone: tenant.whatsappPhone || '',
    });
    fetchAiData(tenant.id);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTenant(true);
    setErrorMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('Variable NEXT_PUBLIC_API_URL no configurada');

      const res = await fetch(`${apiUrl}/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al crear la compañía');
      }

      setSuccessMessage(`¡Compañía '${createForm.name}' creada exitosamente!`);
      setOpenCreateDialog(false);
      setCreateForm({
        name: '',
        slug: '',
        whatsappPhone: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
      });
      fetchTenants();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al crear compañía');
    } finally {
      setIsSubmittingTenant(false);
    }
  };

  const handleSaveWhatsAppConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailTenant) return;
    setIsSavingWhatsapp(true);
    setErrorMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('Variable NEXT_PUBLIC_API_URL no configurada');

      const res = await fetch(`${apiUrl}/tenants/${detailTenant.id}/whatsapp-config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(whatsappForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al guardar configuración de WhatsApp');
      }

      setSuccessMessage(`¡Configuración oficial de WhatsApp actualizada para ${detailTenant.name}!`);
      fetchTenants();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al actualizar WhatsApp');
    } finally {
      setIsSavingWhatsapp(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailTenant) return;
    setIsSubmittingUser(true);
    setErrorMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('Variable NEXT_PUBLIC_API_URL no configurada');

      const res = await fetch(`${apiUrl}/tenants/${detailTenant.id}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al crear usuario');
      }

      setSuccessMessage(`Usuario '${userForm.name}' (${userForm.role}) creado exitosamente`);
      setOpenAddUserDialog(false);
      setUserForm({ name: '', email: '', password: '', role: 'ADMIN' });
      fetchTenants();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al crear usuario');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleOpenEditUser = (user: TenantUser) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setOpenEditUserDialog(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailTenant || !editingUser) return;
    setIsSubmittingEditUser(true);
    setErrorMessage(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('Variable NEXT_PUBLIC_API_URL no configurada');

      const bodyData: any = {
        name: editUserForm.name,
        email: editUserForm.email,
        role: editUserForm.role,
      };
      if (editUserForm.password && editUserForm.password.trim().length >= 6) {
        bodyData.password = editUserForm.password.trim();
      }

      const res = await fetch(`${apiUrl}/tenants/${detailTenant.id}/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar usuario');
      }

      // Actualizar usuario en el estado local de detailTenant
      setDetailTenant((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          users: (prev.users || []).map((u) => (u.id === data.id ? { ...u, ...data } : u)),
        };
      });

      setSuccessMessage(`Usuario '${data.name}' actualizado exitosamente`);
      setOpenEditUserDialog(false);
      setEditingUser(null);
      await fetchTenants();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al actualizar usuario');
    } finally {
      setIsSubmittingEditUser(false);
    }
  };

  const handleToggleUserStatus = async (user: TenantUser) => {
    if (!detailTenant) return;
    setIsTogglingStatus(user.id);
    setErrorMessage(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('Variable NEXT_PUBLIC_API_URL no configurada');

      const res = await fetch(`${apiUrl}/tenants/${detailTenant.id}/users/${user.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al cambiar estado del usuario');
      }

      // Actualizar usuario en el estado local de detailTenant
      setDetailTenant((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          users: (prev.users || []).map((u) => (u.id === data.id ? { ...u, ...data } : u)),
        };
      });

      const statusText = data.isActive ? 'activado' : 'inactivado';
      setSuccessMessage(`Usuario '${data.name}' ${statusText} correctamente`);
      await fetchTenants();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al cambiar estado del usuario');
    } finally {
      setIsTogglingStatus(null);
    }
  };

  // Métricas acumuladas
  const totalUsers = tenants.reduce((acc, t) => acc + (t._count?.users || 0), 0);
  const totalCustomers = tenants.reduce((acc, t) => acc + (t._count?.customers || 0), 0);
  const totalTickets = tenants.reduce((acc, t) => acc + (t._count?.tickets || 0), 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header & Action Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
            Gestión de Compañías (Multi-Tenant)
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Panel de control exclusivo de Superadministrador para provisión de empresas, usuarios y líneas de WhatsApp
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
          sx={{
            bgcolor: '#0284c7',
            '&:hover': { bgcolor: '#0369a1' },
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
            px: 2.5,
            py: 1,
          }}
        >
          Nueva Compañía
        </Button>
      </Box>

      {/* Alerts */}
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ borderRadius: 2 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ borderRadius: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Metrics Row */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#e0f2fe', color: '#0284c7', borderRadius: 2 }}>
                <BusinessIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  COMPAÑÍAS REGISTRADAS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                  {tenants.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#ecfdf5', color: '#059669', borderRadius: 2 }}>
                <PeopleIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  USUARIOS TOTALES
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                  {totalUsers}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#fef3c7', color: '#d97706', borderRadius: 2 }}>
                <WhatsAppIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  CLIENTES WHATSAPP
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                  {totalCustomers}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#f3e8ff', color: '#7c3aed', borderRadius: 2 }}>
                <AssignmentIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  TICKETS TOTALES
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                  {totalTickets}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Companies Table */}
      <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Compañía</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Línea WhatsApp</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Usuarios</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Clientes / Tickets</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#475569' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#0284c7' }} />
                    <Typography variant="body2" sx={{ mt: 1.5, color: '#64748b' }}>
                      Cargando compañías...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                      Aún no hay compañías registradas
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                      Haz clic en 'Nueva Compañía' para crear la primera empresa del sistema.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((t) => {
                  const hasMetaConfig = Boolean(t.whatsappPhoneNumberId);
                  return (
                    <TableRow key={t.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BusinessIcon sx={{ color: '#0284c7', fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                              {t.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              Slug: {t.slug}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#334155' }}>
                          {t.whatsappPhone || 'No asignado'}
                        </Typography>
                        <Chip
                          size="small"
                          label={hasMetaConfig ? 'API Oficial Conectada' : 'Modo Interno'}
                          color={hasMetaConfig ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 18, mt: 0.5, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`${t._count?.users || 0} usuarios`}
                          sx={{ bgcolor: '#e0f2fe', color: '#0284c7', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#334155' }}>
                          {t._count?.customers || 0} clientes • {t._count?.tickets || 0} tickets
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={t.isActive ? 'Activa' : 'Inactiva'}
                          color={t.isActive ? 'success' : 'error'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="Detalle & Usuarios" arrow placement="top">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetail(t, 0)}
                              aria-label="Detalle & Usuarios"
                              sx={{
                                color: '#0284c7',
                                bgcolor: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                borderRadius: 2,
                                p: 1,
                                '&:hover': { bgcolor: '#e0f2fe' },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Configurar WhatsApp" arrow placement="top">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetail(t, 1)}
                              aria-label="Configurar WhatsApp"
                              sx={{
                                color: '#16a34a',
                                bgcolor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: 2,
                                p: 1,
                                '&:hover': { bgcolor: '#dcfce7' },
                              }}
                            >
                              <WhatsAppIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Entrenamiento & Reglas IA" arrow placement="top">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetail(t, 2)}
                              aria-label="Entrenamiento IA"
                              sx={{
                                color: '#7c3aed',
                                bgcolor: '#f5f3ff',
                                border: '1px solid #ddd6fe',
                                borderRadius: 2,
                                p: 1,
                                '&:hover': { bgcolor: '#ede9fe' },
                              }}
                            >
                              <SmartToyIcon fontSize="small" />
                            </IconButton>
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
      </Card>

      {/* ======================================================== */}
      {/* MODAL: DETALLE DE COMPAÑÍA (USUARIOS + WHATSAPP CONFIG)   */}
      {/* ======================================================== */}
      <Dialog
        open={Boolean(detailTenant)}
        onClose={() => setDetailTenant(null)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '90vh' } } }}
      >
        <DialogTitle sx={{ p: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                {detailTenant?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Slug: {detailTenant?.slug} • ID: {detailTenant?.id}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={detailTenant?.whatsappPhoneNumberId ? 'WhatsApp Oficial Conectado' : 'WhatsApp Modo Interno'}
                color={detailTenant?.whatsappPhoneNumberId ? 'success' : 'default'}
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
              <Tooltip title="Cerrar ventana" arrow placement="top">
                <IconButton size="small" onClick={() => setDetailTenant(null)} aria-label="Cerrar">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{ mt: 2, borderBottom: '1px solid #e2e8f0' }}
          >
            <Tab icon={<PeopleIcon />} iconPosition="start" label={`Usuarios (${detailTenant?.users?.length || 0})`} sx={{ textTransform: 'none', fontWeight: 'bold' }} />
            <Tab icon={<WhatsAppIcon />} iconPosition="start" label="Configuración WhatsApp Cloud API" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
            <Tab icon={<SmartToyIcon />} iconPosition="start" label="Entrenamiento IA (Superadmin)" sx={{ textTransform: 'none', fontWeight: 'bold', color: '#7c3aed' }} />
          </Tabs>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* TAB 0: LISTADO DE USUARIOS Y BOTÓN CREAR */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                  Usuarios de la Empresa
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setOpenAddUserDialog(true)}
                  sx={{
                    bgcolor: '#059669',
                    '&:hover': { bgcolor: '#047857' },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  + Crear Usuario
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Correo Electrónico</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Rol en Empresa</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailTenant?.users && detailTenant.users.length > 0 ? (
                      detailTenant.users.map((u) => (
                        <TableRow key={u.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                          <TableCell sx={{ color: '#475569' }}>{u.email}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={u.role}
                              color={u.role === 'ADMIN' ? 'primary' : u.role === 'TECHNICIAN' ? 'warning' : 'default'}
                              sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={u.isActive ? 'Activo' : 'Inactivo'}
                              color={u.isActive ? 'success' : 'error'}
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Tooltip title="Editar Usuario" arrow placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEditUser(u)}
                                  aria-label="Editar Usuario"
                                  sx={{
                                    color: '#0284c7',
                                    bgcolor: '#f0f9ff',
                                    border: '1px solid #bae6fd',
                                    borderRadius: 2,
                                    p: 0.8,
                                    '&:hover': { bgcolor: '#e0f2fe' },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip
                                title={u.isActive ? 'Inactivar Usuario' : 'Activar Usuario'}
                                arrow
                                placement="top"
                              >
                                <IconButton
                                  size="small"
                                  disabled={isTogglingStatus === u.id}
                                  onClick={() => handleToggleUserStatus(u)}
                                  aria-label={u.isActive ? 'Inactivar Usuario' : 'Activar Usuario'}
                                  sx={{
                                    color: u.isActive ? '#dc2626' : '#16a34a',
                                    bgcolor: u.isActive ? '#fef2f2' : '#f0fdf4',
                                    border: `1px solid ${u.isActive ? '#fecaca' : '#bbf7d0'}`,
                                    borderRadius: 2,
                                    p: 0.8,
                                    '&:hover': { bgcolor: u.isActive ? '#fee2e2' : '#dcfce7' },
                                  }}
                                >
                                  {isTogglingStatus === u.id ? (
                                    <CircularProgress size={16} color="inherit" />
                                  ) : u.isActive ? (
                                    <BlockIcon fontSize="small" />
                                  ) : (
                                    <CheckCircleIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#64748b' }}>
                          No hay usuarios registrados en esta compañía.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* TAB 1: CONFIGURACIÓN WHATSAPP CLOUD API (META OFICIAL) */}
          {activeTab === 1 && (
            <Box component="form" onSubmit={handleSaveWhatsAppConfig} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Requisitos oficiales de Meta WhatsApp Business Cloud API (Graph API v21.0):
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#334155' }}>
                  Obtén estos parámetros desde la consola de Meta for Developers (developers.facebook.com). Con ellos, la empresa podrá enviar y recibir mensajes directamente por la línea de WhatsApp oficial sin intermediarios ni riesgo de suspensión.
                </Typography>
              </Alert>

              <TextField
                label="WhatsApp Phone Number ID"
                placeholder="Ej: 102938475610293"
                value={whatsappForm.whatsappPhoneNumberId}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsappPhoneNumberId: e.target.value })}
                fullWidth
                helperText="ID único que Meta asigna al número telefónico en la sección API Setup de WhatsApp"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label="WhatsApp Business Account ID (WABA ID)"
                placeholder="Ej: 987654321098765"
                value={whatsappForm.whatsappWabaId}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsappWabaId: e.target.value })}
                fullWidth
                helperText="ID de la cuenta comercial de WhatsApp (WABA) en Meta Business Manager"
              />

              <TextField
                label="System User Permanent Access Token (Token de Acceso Permanente)"
                type={showAccessToken ? 'text' : 'password'}
                placeholder="EAA..."
                value={whatsappForm.whatsappAccessToken}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsappAccessToken: e.target.value })}
                fullWidth
                helperText="Token de Sistema generado en Meta Business Manager con permisos 'whatsapp_business_messaging'"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowAccessToken(!showAccessToken)} edge="end">
                          {showAccessToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label="Número Telefónico Visible"
                placeholder="Ej: +54 9 11 5555-0199"
                value={whatsappForm.whatsappPhone}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsappPhone: e.target.value })}
                fullWidth
                helperText="Número oficial con prefijo internacional que verán los clientes"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                  Datos para configurar el Webhook en Meta Developers:
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#64748b' }}>
                  <strong>Callback URL:</strong> <code>{typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook` : '/api/whatsapp/webhook'}</code>
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                  <strong>Verify Token:</strong> <code>meta_webhook_verify_token_whatsapp_crm</code>
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSavingWhatsapp}
                  sx={{
                    bgcolor: '#25D366',
                    '&:hover': { bgcolor: '#1ea952' },
                    color: '#ffffff',
                    fontWeight: 'bold',
                    px: 3,
                    py: 1,
                  }}
                >
                  {isSavingWhatsapp ? <CircularProgress size={20} color="inherit" /> : 'Guardar Configuración de WhatsApp'}
                </Button>
              </Box>
            </Box>
          )}

          {/* TAB 2: ENTRENAMIENTO IA & REGLAS (EXCLUSIVO SUPERADMIN) */}
          {activeTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Subtabs Selector */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={aiSubTab}
                  onChange={(_, val) => setAiSubTab(val)}
                  textColor="secondary"
                  indicatorColor="secondary"
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab icon={<KeyIcon />} iconPosition="start" label="Credenciales & Modelo" sx={{ textTransform: 'none', fontWeight: 600 }} />
                  <Tab icon={<RuleIcon />} iconPosition="start" label={`Reglas de Comportamiento (${aiRules.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
                  <Tab icon={<MenuBookIcon />} iconPosition="start" label={`Base de Conocimientos (${aiKnowledge.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
                  <Tab icon={<ScienceIcon />} iconPosition="start" label="🧪 Simulador / Playground" sx={{ textTransform: 'none', fontWeight: 600, color: '#7c3aed' }} />
                </Tabs>
              </Box>

              {/* SUBTAB 0: CREDENCIALES & MODELO */}
              {aiSubTab === 0 && (
                <Box component="form" onSubmit={handleSaveAiConfig} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Control de Inteligencia Artificial para {detailTenant?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#334155' }}>
                      Configuración administrada de forma centralizada por el Superadministrador. Si la empresa cuenta con su propia clave de Google Gemini, regístrala aquí. Si se deja en blanco, el asistente operará con la clave general del sistema.
                    </Typography>
                  </Alert>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={aiConfigForm.aiEnabled}
                        onChange={(e) => setAiConfigForm({ ...aiConfigForm, aiEnabled: e.target.checked })}
                        color="secondary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Asistente de IA Activo para WhatsApp
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Permite que la IA atienda y diagnostique clientes automáticamente en primer contacto.
                        </Typography>
                      </Box>
                    }
                  />

                  <TextField
                    label="Google Gemini API Key (Exclusiva de la Empresa)"
                    type={showGeminiApiKey ? 'text' : 'password'}
                    placeholder={aiConfigForm.hasCustomApiKey ? '•••••••••••••••• (dejar en blanco para conservar clave actual)' : 'AIzaSy... (opcional)'}
                    value={aiConfigForm.geminiApiKey}
                    onChange={(e) => setAiConfigForm({ ...aiConfigForm, geminiApiKey: e.target.value })}
                    fullWidth
                    helperText={
                      aiConfigForm.hasCustomApiKey
                        ? `Esta compañía tiene asignada su propia API Key activa (${aiConfigForm.maskedApiKey}).`
                        : 'Sin clave asignada: Utiliza la API Key de Gemini configurada globalmente en el backend (.env).'
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <KeyIcon sx={{ color: '#94a3b8' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowGeminiApiKey(!showGeminiApiKey)} edge="end">
                              {showGeminiApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      select
                      label="Modelo de Inteligencia Artificial"
                      value={aiConfigForm.geminiModel}
                      onChange={(e) => setAiConfigForm({ ...aiConfigForm, geminiModel: e.target.value })}
                      fullWidth
                    >
                      <MenuItem value="gemini-2.0-flash">Google Gemini 2.0 Flash (Recomendado - Ultra Rápido)</MenuItem>
                      <MenuItem value="gemini-1.5-flash">Google Gemini 1.5 Flash (Baja latencia)</MenuItem>
                      <MenuItem value="gemini-1.5-pro">Google Gemini 1.5 Pro (Razonamiento complejo)</MenuItem>
                    </TextField>

                    <Box sx={{ px: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                        Temperatura / Creatividad: {aiConfigForm.aiTemperature}
                      </Typography>
                      <Slider
                        value={aiConfigForm.aiTemperature}
                        min={0.0}
                        max={1.0}
                        step={0.1}
                        marks={[
                          { value: 0.1, label: '0.1 Preciso' },
                          { value: 0.5, label: '0.5' },
                          { value: 0.9, label: '0.9 Creativo' },
                        ]}
                        onChange={(_, val) => setAiConfigForm({ ...aiConfigForm, aiTemperature: val as number })}
                        color="secondary"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>

                  <TextField
                    label="Directiva Base de Identidad y Empresa (System Prompt)"
                    placeholder="Ej: Eres el asistente oficial de HelpCopies SRL. Tu objetivo es coordinar servicio técnico para fotocopiadoras, impresoras y escáneres..."
                    value={aiConfigForm.aiSystemPrompt}
                    onChange={(e) => setAiConfigForm({ ...aiConfigForm, aiSystemPrompt: e.target.value })}
                    multiline
                    rows={3}
                    fullWidth
                    helperText="Define el rol general de la empresa antes de aplicar las reglas específicas."
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSavingAiConfig}
                      sx={{
                        bgcolor: '#7c3aed',
                        '&:hover': { bgcolor: '#6d28d9' },
                        color: '#ffffff',
                        fontWeight: 'bold',
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                      }}
                    >
                      {isSavingAiConfig ? <CircularProgress size={20} color="inherit" /> : 'Guardar Configuración de IA'}
                    </Button>
                  </Box>
                </Box>
              )}

              {/* SUBTAB 1: REGLAS DE COMPORTAMIENTO (GUARDRAILS) */}
              {aiSubTab === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                        Reglas y Políticas Activas
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        Directivas prioritarias que la IA obedece al interactuar con los clientes.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setRuleForm({ title: '', instruction: '', category: 'BUSINESS', priority: 1 });
                        setOpenRuleDialog(true);
                      }}
                      sx={{
                        bgcolor: '#7c3aed',
                        '&:hover': { bgcolor: '#6d28d9' },
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold',
                      }}
                    >
                      + Nueva Regla
                    </Button>
                  </Box>

                  {isLoadingAiRules ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress size={28} sx={{ color: '#7c3aed' }} />
                    </Box>
                  ) : aiRules.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2, color: '#64748b' }}>
                      <RuleIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        No hay reglas de comportamiento configuradas aún.
                      </Typography>
                      <Typography variant="caption">
                        Crea directivas de tono, restricciones de precios o criterios de derivación.
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={1.5}>
                      {aiRules.map((r) => {
                        const categoryColor =
                          r.category === 'RESTRICTION'
                            ? 'error'
                            : r.category === 'TONE'
                            ? 'info'
                            : r.category === 'ESCALATION'
                            ? 'warning'
                            : 'success';

                        return (
                          <Paper
                            key={r.id}
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              bgcolor: r.isActive ? '#ffffff' : '#f8fafc',
                              opacity: r.isActive ? 1 : 0.65,
                            }}
                          >
                            <Box sx={{ flex: 1, pr: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Chip
                                  size="small"
                                  label={r.category}
                                  color={categoryColor as any}
                                  sx={{ fontWeight: 'bold', fontSize: '0.65rem', height: 20 }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                                  {r.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                  (Prioridad: {r.priority})
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ color: '#334155' }}>
                                {r.instruction}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Tooltip title={r.isActive ? 'Pausar regla' : 'Activar regla'} arrow>
                                <Switch
                                  checked={r.isActive}
                                  size="small"
                                  color="secondary"
                                  onChange={() => handleToggleRule(r)}
                                />
                              </Tooltip>

                              <Tooltip title="Editar Regla" arrow placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setRuleForm({
                                      id: r.id,
                                      title: r.title,
                                      instruction: r.instruction,
                                      category: r.category,
                                      priority: r.priority,
                                    });
                                    setOpenRuleDialog(true);
                                  }}
                                  sx={{ color: '#0284c7' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Eliminar Regla" arrow placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteRule(r.id)}
                                  sx={{ color: '#ef4444' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Stack>
                  )}
                </Box>
              )}

              {/* SUBTAB 2: BASE DE CONOCIMIENTOS (FAQS) */}
              {aiSubTab === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                        Base de Conocimientos Técnicos & FAQs
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        Respuestas oficiales y procedimientos paso a paso de los equipos de la compañía.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setKnowledgeForm({ question: '', answer: '', tags: '' });
                        setOpenKnowledgeDialog(true);
                      }}
                      sx={{
                        bgcolor: '#7c3aed',
                        '&:hover': { bgcolor: '#6d28d9' },
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold',
                      }}
                    >
                      + Nuevo Conocimiento
                    </Button>
                  </Box>

                  {isLoadingKnowledge ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress size={28} sx={{ color: '#7c3aed' }} />
                    </Box>
                  ) : aiKnowledge.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2, color: '#64748b' }}>
                      <MenuBookIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        No hay ítems en la base de conocimientos.
                      </Typography>
                      <Typography variant="caption">
                        Agrega preguntas frecuentes o manuales de reinicio para que la IA los utilice como referencia.
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={1.5}>
                      {aiKnowledge.map((k) => (
                        <Paper
                          key={k.id}
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: k.isActive ? '#ffffff' : '#f8fafc',
                            opacity: k.isActive ? 1 : 0.65,
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1, pr: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 0.5 }}>
                                {k.question}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#334155', whiteSpace: 'pre-wrap', mb: 1 }}>
                                {k.answer}
                              </Typography>
                              {k.tags && k.tags.length > 0 && (
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {k.tags.map((tag) => (
                                    <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                                  ))}
                                </Box>
                              )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Tooltip title={k.isActive ? 'Pausar ítem' : 'Activar ítem'} arrow>
                                <Switch
                                  checked={k.isActive}
                                  size="small"
                                  color="secondary"
                                  onChange={() => handleToggleKnowledge(k)}
                                />
                              </Tooltip>
                              <Tooltip title="Editar" arrow placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setKnowledgeForm({
                                      id: k.id,
                                      question: k.question,
                                      answer: k.answer,
                                      tags: (k.tags || []).join(', '),
                                    });
                                    setOpenKnowledgeDialog(true);
                                  }}
                                  sx={{ color: '#0284c7' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar" arrow placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteKnowledge(k.id)}
                                  sx={{ color: '#ef4444' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}

              {/* SUBTAB 3: 🧪 SIMULADOR / PLAYGROUND */}
              {aiSubTab === 3 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Simulador de Atención en Vivo para {detailTenant?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#334155' }}>
                      Prueba en tiempo real cómo responderá el asistente virtual utilizando las {aiRules.filter((r) => r.isActive).length} reglas activas y {aiKnowledge.filter((k) => k.isActive).length} ítems de conocimiento configurados.
                    </Typography>
                  </Alert>

                  {/* Consola de Chat */}
                  <Paper
                    variant="outlined"
                    sx={{
                      height: 320,
                      overflowY: 'auto',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                    }}
                  >
                    {simulationHistory.length === 0 ? (
                      <Box sx={{ m: 'auto', textAlign: 'center', color: '#94a3b8' }}>
                        <ScienceIcon sx={{ fontSize: 36, mb: 1, color: '#cbd5e1' }} />
                        <Typography variant="body2">
                          Escribe un mensaje de prueba abajo para evaluar el comportamiento del asistente.
                        </Typography>
                      </Box>
                    ) : (
                      simulationHistory.map((msg, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <Paper
                            sx={{
                              p: 1.5,
                              maxWidth: '80%',
                              borderRadius: 2,
                              bgcolor: msg.sender === 'user' ? '#128C7E' : '#ffffff',
                              color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                              border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                            }}
                          >
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {msg.text}
                            </Typography>
                          </Paper>
                          {msg.meta && (
                            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, px: 0.5 }}>
                              {msg.meta.isLiveAi ? 'Google Gemini' : 'Simulador'} • {msg.meta.modelUsed} • {msg.meta.executionTimeMs}ms • {msg.meta.rulesCount} reglas
                            </Typography>
                          )}
                        </Box>
                      ))
                    )}
                  </Paper>

                  {/* Input Simulación */}
                  <Box component="form" onSubmit={handleRunSimulation} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Escribe como un cliente... (ej: 'El equipo me tira error E-402, ¿qué hago?')"
                      value={simulatorInput}
                      onChange={(e) => setSimulatorInput(e.target.value)}
                      disabled={isSimulating}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSimulating || !simulatorInput.trim()}
                      sx={{
                        bgcolor: '#7c3aed',
                        '&:hover': { bgcolor: '#6d28d9' },
                        color: '#ffffff',
                        fontWeight: 'bold',
                        px: 3,
                        textTransform: 'none',
                      }}
                    >
                      {isSimulating ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDetailTenant(null)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: CREAR USUARIO DENTRO DE COMPAÑÍA                  */}
      {/* ======================================================== */}
      <Dialog
        open={openAddUserDialog}
        onClose={() => setOpenAddUserDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <form onSubmit={handleCreateUser}>
          <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Nuevo Usuario para {detailTenant?.name}</span>
            <Tooltip title="Cerrar" arrow placement="top">
              <IconButton size="small" onClick={() => setOpenAddUserDialog(false)} aria-label="Cerrar">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nombre y Apellido"
              placeholder="Ej: Marcelo Suárez"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Correo Electrónico"
              type="email"
              placeholder="marcelo@empresa.com"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Contraseña Inicial"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              required
              fullWidth
            />
            <TextField
              select
              label="Rol en la Empresa"
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              fullWidth
            >
              <MenuItem value="ADMIN">Administrador de Empresa</MenuItem>
              <MenuItem value="TECHNICIAN">Técnico Especialista</MenuItem>
              <MenuItem value="AGENT">Agente de Atención WhatsApp</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenAddUserDialog(false)} color="inherit">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmittingUser}
              sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, fontWeight: 'bold' }}
            >
              {isSubmittingUser ? <CircularProgress size={20} color="inherit" /> : 'Guardar Usuario'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: EDITAR USUARIO DE COMPAÑÍA                        */}
      {/* ======================================================== */}
      <Dialog
        open={openEditUserDialog}
        onClose={() => setOpenEditUserDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <form onSubmit={handleUpdateUser}>
          <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Editar Usuario</span>
            <Tooltip title="Cerrar" arrow placement="top">
              <IconButton size="small" onClick={() => setOpenEditUserDialog(false)} aria-label="Cerrar">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nombre y Apellido"
              placeholder="Ej: Marcelo Suárez"
              value={editUserForm.name}
              onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Correo Electrónico"
              type="email"
              placeholder="marcelo@empresa.com"
              value={editUserForm.email}
              onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Nueva Contraseña (Opcional)"
              type="password"
              placeholder="•••••••• (dejar en blanco para no cambiar)"
              value={editUserForm.password}
              onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
              fullWidth
              helperText="Mínimo 6 caracteres si deseas renovar su clave"
            />
            <TextField
              select
              label="Rol en la Empresa"
              value={editUserForm.role}
              onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
              fullWidth
            >
              <MenuItem value="ADMIN">ADMIN (Administrador de Empresa)</MenuItem>
              <MenuItem value="TECHNICIAN">TECHNICIAN (Técnico Especialista)</MenuItem>
              <MenuItem value="AGENT">AGENT (Agente de Atención WhatsApp)</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button onClick={() => setOpenEditUserDialog(false)} color="inherit" sx={{ textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmittingEditUser}
              sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, fontWeight: 'bold', textTransform: 'none' }}
            >
              {isSubmittingEditUser ? <CircularProgress size={20} color="inherit" /> : 'Guardar Cambios'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: CREAR NUEVA COMPAÑÍA                              */}
      {/* ======================================================== */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <form onSubmit={handleCreateTenant}>
          <DialogTitle sx={{ fontWeight: 'bold', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Nueva Compañía y Usuario Administrador</span>
            <Tooltip title="Cerrar" arrow placement="top">
              <IconButton size="small" onClick={() => setOpenCreateDialog(false)} aria-label="Cerrar">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
              Registra una nueva empresa en la plataforma y genera su credencial de Administrador principal.
            </Typography>

            <TextField
              label="Nombre de la Compañía"
              placeholder="Ej: Metalúrgica San Jorge S.A."
              value={createForm.name}
              onChange={(e) => {
                const name = e.target.value;
                const autoSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                setCreateForm((prev) => ({ ...prev, name, slug: autoSlug }));
              }}
              required
              fullWidth
            />

            <TextField
              label="Identificador único (Slug)"
              placeholder="ej: metalurgica-san-jorge"
              value={createForm.slug}
              onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
              required
              fullWidth
              helperText="Identificador interno para base de datos"
            />

            <TextField
              label="Teléfono WhatsApp (Opcional)"
              placeholder="+54 9 11 5555-0199"
              value={createForm.whatsappPhone}
              onChange={(e) => setCreateForm({ ...createForm, whatsappPhone: e.target.value })}
              fullWidth
            />

            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1.5, color: '#0f172a' }}>
              Credenciales del Administrador de la Empresa:
            </Typography>

            <TextField
              label="Nombre del Administrador"
              placeholder="Ej: Roberto Pérez"
              value={createForm.adminName}
              onChange={(e) => setCreateForm({ ...createForm, adminName: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Correo Electrónico del Administrador"
              type="email"
              placeholder="roberto@sanjorge.com"
              value={createForm.adminEmail}
              onChange={(e) => setCreateForm({ ...createForm, adminEmail: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Contraseña Inicial"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={createForm.adminPassword}
              onChange={(e) => setCreateForm({ ...createForm, adminPassword: e.target.value })}
              required
              fullWidth
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenCreateDialog(false)} color="inherit">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmittingTenant}
              sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, fontWeight: 'bold' }}
            >
              {isSubmittingTenant ? <CircularProgress size={20} color="inherit" /> : 'Crear Compañía'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: CREAR / EDITAR REGLA DE COMPORTAMIENTO IA         */}
      {/* ======================================================== */}
      <Dialog
        open={openRuleDialog}
        onClose={() => setOpenRuleDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <form onSubmit={handleSaveRule}>
          <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{ruleForm.id ? 'Editar Regla de Comportamiento' : 'Nueva Regla de Comportamiento'}</span>
            <Tooltip title="Cerrar" arrow placement="top">
              <IconButton size="small" onClick={() => setOpenRuleDialog(false)} aria-label="Cerrar">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Define directrices estrictas de conducta, tono, restricciones o protocolos de derivación para {detailTenant?.name}.
            </Typography>

            <TextField
              label="Título de la Regla"
              placeholder="Ej: Restricción de precios o Tono profesional y empático"
              value={ruleForm.title}
              onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
              required
              fullWidth
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                select
                label="Categoría"
                value={ruleForm.category}
                onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value as any })}
                fullWidth
              >
                <MenuItem value="TONE">TONE (Tono y Estilo de Respuesta)</MenuItem>
                <MenuItem value="RESTRICTION">RESTRICTION (Restricción / Guardrail)</MenuItem>
                <MenuItem value="BUSINESS">BUSINESS (Regla de Negocio / Procedimiento)</MenuItem>
                <MenuItem value="ESCALATION">ESCALATION (Criterio de Derivación a Humano)</MenuItem>
              </TextField>

              <TextField
                type="number"
                label="Prioridad (1 = Mayor jerarquía)"
                value={ruleForm.priority}
                onChange={(e) => setRuleForm({ ...ruleForm, priority: Number(e.target.value) })}
                slotProps={{ htmlInput: { min: 1, max: 100 } }}
                fullWidth
              />
            </Box>

            <TextField
              label="Instrucción / Directiva Específica"
              placeholder="Ej: Nunca entregues precios de repuestos o insumos sin solicitar antes el modelo y número de serie exacto de la fotocopiadora."
              value={ruleForm.instruction}
              onChange={(e) => setRuleForm({ ...ruleForm, instruction: e.target.value })}
              required
              multiline
              rows={4}
              fullWidth
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenRuleDialog(false)} color="inherit" sx={{ textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSavingRule}
              sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, fontWeight: 'bold', textTransform: 'none' }}
            >
              {isSavingRule ? <CircularProgress size={20} color="inherit" /> : 'Guardar Regla'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: CREAR / EDITAR CONOCIMIENTO / FAQ IA              */}
      {/* ======================================================== */}
      <Dialog
        open={openKnowledgeDialog}
        onClose={() => setOpenKnowledgeDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <form onSubmit={handleSaveKnowledge}>
          <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{knowledgeForm.id ? 'Editar Ítem de Conocimiento' : 'Nuevo Ítem de Conocimiento'}</span>
            <Tooltip title="Cerrar" arrow placement="top">
              <IconButton size="small" onClick={() => setOpenKnowledgeDialog(false)} aria-label="Cerrar">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Proporciona respuestas oficiales a dudas técnicas frecuentes, manuales de reinicio o políticas de atención.
            </Typography>

            <TextField
              label="Pregunta / Problema Técnico"
              placeholder="Ej: ¿Qué hacer si el equipo marca Error de Atasco C-12 o código E-402?"
              value={knowledgeForm.question}
              onChange={(e) => setKnowledgeForm({ ...knowledgeForm, question: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Respuesta Oficial / Procedimiento de Solución"
              placeholder="Ej: 1. Abrir la compuerta lateral derecha.\n2. Retirar con cuidado el papel sin jalar bruscamente.\n3. Cerrar y apagar durante 15 segundos.\nSi el error persiste, derivar al equipo técnico."
              value={knowledgeForm.answer}
              onChange={(e) => setKnowledgeForm({ ...knowledgeForm, answer: e.target.value })}
              required
              multiline
              rows={5}
              fullWidth
            />

            <TextField
              label="Etiquetas / Tags (separados por coma)"
              placeholder="atasco, error e-402, hardware, reinicio"
              value={knowledgeForm.tags}
              onChange={(e) => setKnowledgeForm({ ...knowledgeForm, tags: e.target.value })}
              fullWidth
              helperText="Palabras clave para relacionar la consulta"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenKnowledgeDialog(false)} color="inherit" sx={{ textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSavingKnowledge}
              sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, fontWeight: 'bold', textTransform: 'none' }}
            >
              {isSavingKnowledge ? <CircularProgress size={20} color="inherit" /> : 'Guardar Conocimiento'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
