'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  SmartToy,
  Security as SecurityIcon,
} from '@mui/icons-material';

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Ingresa un correo electrónico válido')
    .required('El correo electrónico es obligatorio'),
  password: yup
    .string()
    .min(6, 'La contraseña debe contener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export default function LoginView() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error('Variable de entorno NEXT_PUBLIC_API_URL no configurada');
      }

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al iniciar sesión');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', result.accessToken);
        localStorage.setItem(
          'auth_user',
          JSON.stringify({
            ...result.user,
            tenant: result.tenant,
            permissions: result.permissions,
          }),
        );
      }

      // Redirigir según el rol del usuario autenticado
      if (result.user.role === 'SUPER_ADMIN') {
        router.push('/companies');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: { xs: '#0f172a', md: '#ffffff' },
      }}
    >
      {/* Panel Izquierdo: Ilustración Tecnológica */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #f4f7fc 0%, #e9f0f9 100%)',
          p: { md: 4, lg: 6 },
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid #e2e8f0',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 680,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Box
            sx={{
              width: '100%',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              bgcolor: '#f3f6fb',
            }}
          >
            <Image
              src="/images/login-helpdesk-ia.jpg"
              alt="HelpDesk IA: atención automatizada por WhatsApp, creación de tickets y supervisión técnica"
              width={1200}
              height={896}
              priority
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </Box>

          <Box sx={{ textAlign: 'center', maxWidth: 520 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.75 }}>
              Soporte Técnico Inteligente en Tiempo Real
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
              La IA atiende consultas por WhatsApp, diagnostica incidencias y genera tickets
              automáticamente bajo la supervisión de tu equipo técnico.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Panel Derecho: Formulario de Acceso */}
      <Box
        sx={{
          width: { xs: '100%', md: 480, lg: 520 },
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          bgcolor: { xs: '#0f172a', md: '#ffffff' },
        }}
      >
        <Card
          sx={{
            maxWidth: 420,
            width: '100%',
            borderRadius: 3,
            boxShadow: {
              xs: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
              md: 'none',
            },
            bgcolor: '#ffffff',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 2 } }}>
          {/* Header Brand */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                bgcolor: '#128C7E',
                color: '#ffffff',
                borderRadius: 2.5,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                boxShadow: '0 4px 6px -1px rgba(18, 140, 126, 0.4)',
              }}
            >
              <SmartToy sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
              HelpDesk IA
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              CRM WhatsApp Multi-Tenant & Soporte Inteligente
            </Typography>
          </Box>

          {/* Error Alert */}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                placeholder="ejemplo@empresa.com"
                {...register('email')}
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label="alternar visibilidad de contraseña"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  py: 1.4,
                  bgcolor: '#128C7E',
                  '&:hover': { bgcolor: '#0e7064' },
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  textTransform: 'none',
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} sx={{ color: '#ffffff' }} />
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3 }} />

          {/* Footer security tag */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <SecurityIcon sx={{ fontSize: 16, color: '#10b981' }} />
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Autenticación JWT con RBAC y Aislamiento Multi-Tenant
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
