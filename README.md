# 💻 Frontend - WhatsApp AI CRM & Technical Service Portal

Portal web interactivo construido con **Next.js 16 (Turbopack + App Router)**, **TypeScript** y **Material-UI (MUI v6)**. Proporciona una interfaz moderna estilo ERP para la atención de chats de WhatsApp, gestión de órdenes de servicio técnico, administración de personal y entrenamiento de modelos de IA por empresa.

---

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 16](https://nextjs.org/) (Turbopack, App Router, React 19)
- **Lenguaje**: TypeScript
- **Librería de Componentes**: [Material-UI (MUI v6)](https://mui.com/)
- **Iconografía**: `@mui/icons-material`
- **Sockets en Tiempo Real**: [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- **Gestión de Fechas y Utilidades**: Date-fns, Emotion

---

## 📂 Vistas y Rutas Principales

```
src/
├── app/
│   ├── chat/page.tsx             # Ruta /chat: Bandeja de entrada en vivo
│   ├── companies/page.tsx        # Ruta /companies: Gestión de empresas (Superadmin)
│   ├── dashboard/page.tsx        # Ruta /dashboard: Métricas operativas
│   ├── login/page.tsx            # Ruta /login: Inicio de sesión
│   ├── tickets/page.tsx          # Ruta /tickets: Órdenes de servicio y reclamos
│   └── users/page.tsx            # Ruta /users: Gestión de personal (Admin)
├── components/
│   └── ThemeRegistry/            # Configuración de SSR y tema corporativo MUI
├── hooks/
│   └── useSocket.ts              # Conexión persistente y gestión de eventos WebSocket
├── navigation/
│   └── navigationItems.ts        # Definición de elementos de menú y reglas de roles
└── views/
    ├── auth/LoginView.tsx        # Formulario de acceso con redirección por rol
    ├── chat/ChatView.tsx         # Chat WhatsApp con human takeover y panel lateral
    ├── companies/CompaniesView.tsx # Panel de empresas y entrenamiento de IA
    ├── dashboard/DashboardView.tsx # Estadísticas de atención y tiempos de respuesta
    ├── layout/                   # Layout con Navbar, Sidebar y control de roles
    ├── tickets/TicketsView.tsx   # Tabla ERP de tickets, modales de edición y OS
    └── users/UsersView.tsx       # Tabla ERP de usuarios, cambio de roles y claves
```

---

## 🌟 Características de la Interfaz

### 💬 Chat Omnicanal en Tiempo Real (`/chat`)
- Bandeja de chats con filtros por estado: **Atendiendo IA (Bot)**, **En Espera de Técnico**, **Atendido por Operador** y **Resuelto**.
- **Control de IA**:
  - Botón **"Tomar Conversación"**: Desactiva las respuestas automáticas del bot y asigna la conversación al operador.
  - Botón **"Devolver a IA"**: Reactiva el bot para que continúe la conversación.
- **Ficha Lateral de Contexto**:
  - Datos completos del cliente (WhatsApp, razón social, dirección).
  - Listado de equipos técnicos asociados con número de serie.
  - Indicador de Orden de Servicio vinculada.

### 📋 Órdenes de Servicio y Tickets (`/tickets`)
- **Diseño Tabular HelpCopies ERP**: Filas y columnas claras con información de contacto, modelo del equipo, serie y resumen del diagnóstico formulado por la IA.
- **Modales Rápidos con `<Select>`**:
  - Al hacer clic en el chip de **Modalidad**, permite conmutar entre *🚗 Visita Presencial* y *💬 Remoto WhatsApp*.
  - Al hacer clic en el chip de **Prioridad**, permite cambiar entre *CRITICAL*, *HIGH*, *MEDIUM* y *LOW*.
  - Al hacer clic en el chip de **Estado**, permite cambiar entre *OPEN*, *IN_PROGRESS* y *RESOLVED*.
- **Generador de Orden de Servicio a WhatsApp**:
  - Modal con campo para ingresar el número de Orden de Servicio interna/Tango ERP.
  - Generación automática de mensaje profesional editable con envío directo a la conversación de WhatsApp del cliente.

### 👥 Gestión de Usuarios del Equipo (`/users`)
- **Restricción Estricta**: Visible y accesible exclusivamente para usuarios con rol `ADMIN` (u opcionalmente `SUPER_ADMIN`).
- **Tabla de Personal**:
  - Avatar identificatorio con iniciales.
  - Chip interactivo de Rol: *🛡️ Administrador*, *🔧 Técnico Especialista* o *💬 Operador Soporte*.
  - Switch instantáneo de activación / inactivación de acceso.
  - Modal para **Cambiar Contraseña** de cualquier usuario con validaciones de seguridad.
  - Modal para **Editar Datos** y rol del usuario.
  - Botón `+ Nuevo Usuario` para dar de alta personal.

### 🧠 Panel de Entrenamiento de IA (`/companies`)
- **Exclusivo para Superadmin**:
  - Configuración de la API Key de Google Gemini por empresa.
  - Configuración de credenciales de WhatsApp Cloud API (Phone Number ID, WABA ID, Token).
  - Carga y edición de **Reglas de Comportamiento** (Tono, Restricciones, Políticas de Derivación).
  - Base de conocimientos de códigos de error y fallas de impresoras.
  - Ejemplos Few-Shot para afinar la respuesta del modelo.

---

## ⚙️ Variables de Entorno (`.env.local`)

Crea un archivo `.env.local` en la carpeta `frontend/`:

```ini
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

---

## 📦 Comandos Disponibles

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo (Turbopack)
pnpm dev

# Compilar para producción (validación estricta de TypeScript)
pnpm run build

# Iniciar servidor compilado de producción
pnpm start

# Ejecutar linter
pnpm lint
```
