# PrediGo — Enterprise Architecture (Antigravity Ready)

# Overview

PrediGo is a scalable enterprise-grade platform built using:

Frontend:

* Next.js 15
* React 19
* TailwindCSS
* Shadcn UI
* TypeScript

Backend:

* NestJS
* Sequelize
* MySQL
* JWT Authentication

Architecture:

* Monorepo
* Multi-application
* Multi-congregation
* API Gateway Pattern
* Mobile-first
* Enterprise scalable structure

This structure is optimized for:

* Antigravity
* Cursor
* Windsurf
* Claude Code
* Copilot
* AI-assisted development

The goal is to provide:

* maximum scalability
* clean separation of concerns
* reusable architecture
* enterprise maintainability
* domain-driven organization

---

# Recommended Monorepo Structure

```txt
predigo/
│
├── apps/
│   ├── admin/
│   ├── site/
│   ├── api/
│   └── docs/
│
├── packages/
│   ├── ui/
│   ├── config/
│   ├── types/
│   ├── constants/
│   ├── validations/
│   ├── utils/
│   ├── hooks/
│   ├── auth/
│   ├── services/
│   └── eslint-config/
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   ├── mysql/
│   ├── redis/
│   └── monitoring/
│
├── scripts/
│
├── .github/
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

# Applications

# apps/admin

Desktop-oriented administrative panel.

Responsibilities:

* Multi-congregation administration
* User management
* Territory management
* Reports
* Statistics
* Schedules
* Cart administration

---

## Structure

```txt
apps/admin/src/
│
├── app/
├── components/
├── modules/
├── layouts/
├── providers/
├── hooks/
├── services/
├── store/
├── schemas/
├── lib/
├── utils/
├── types/
├── middleware/
└── styles/
```

---

# apps/site

Main mobile-first application.

Responsibilities:

* House-to-house preaching
* Telephone preaching
* Cart witnessing
* Personal schedules
* Notifications
* Territory assignment

---

## Structure

```txt
apps/site/src/
│
├── app/
├── components/
├── modules/
├── layouts/
├── providers/
├── hooks/
├── services/
├── store/
├── schemas/
├── lib/
├── utils/
├── types/
├── middleware/
└── styles/
```

---

# apps/api

NestJS backend application.

Responsibilities:

* Business logic
* Authentication
* Authorization
* Multi-tenancy
* Database access
* Notifications
* Scheduling
* Reporting

---

# NestJS Enterprise Structure

```txt
apps/api/src/
│
├── main.ts
├── app.module.ts
│
├── config/
│
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── middleware/
│   ├── pipes/
│   ├── utils/
│   ├── constants/
│   └── types/
│
├── database/
│   ├── migrations/
│   ├── seeders/
│   ├── factories/
│   ├── models/
│   └── database.module.ts
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── congregations/
│   ├── territories/
│   ├── territory-history/
│   ├── preaching/
│   ├── phone-preaching/
│   ├── carts/
│   ├── schedules/
│   ├── volunteers/
│   ├── notifications/
│   ├── reports/
│   ├── dashboard/
│   └── audit/
│
├── jobs/
│
├── queues/
│
└── integrations/
```

---

# NestJS Module Pattern

Every module MUST follow this structure:

```txt
territories/
│
├── dto/
├── entities/
├── interfaces/
├── repositories/
├── services/
├── controllers/
├── guards/
├── validators/
├── events/
├── listeners/
├── territories.controller.ts
├── territories.service.ts
├── territories.module.ts
└── territories.repository.ts
```

---

# Database Structure

# Main Entities

## Congregations

Represents independent congregations.

Fields:

* id
* name
* code
* city
* country
* timezone
* settings

---

## Users

Fields:

* id
* congregation_id
* first_name
* last_name
* email
* password
* role
* phone
* is_active

---

## Territories

Fields:

* id
* congregation_id
* code
* name
* type
* status
* assigned_to
* assigned_at
* completed_at
* geojson

---

## Territory History

Tracks territory activity.

Fields:

* territory_id
* assigned_by
* assigned_to
* returned_at
* notes

---

## Phone Records

Fields:

* id
* congregation_id
* assigned_to
* phone_number
* status
* notes
* revisit_date

---

## Cart Locations

Fields:

* id
* congregation_id
* name
* address
* coordinates

---

## Cart Shifts

Fields:

* id
* location_id
* start_time
* end_time
* max_volunteers
* min_volunteers
* status

---

## Shift Volunteers

Fields:

* shift_id
* user_id
* attendance_status

---

# Multi-Tenancy Strategy

Recommended:

* Shared database
* congregation_id isolation

Every entity MUST include:

* congregation_id

Except:

* Super admin entities

---

# Authentication Strategy

Recommended:

* JWT Access Token
* Refresh Token
* HttpOnly Cookies

---

# RBAC (Role Based Access Control)

Implement:

* Roles
* Permissions
* Policy guards

---

# Shared Packages

# packages/ui

Reusable UI components.

```txt
packages/ui/
│
├── buttons/
├── cards/
├── forms/
├── modals/
├── tables/
├── charts/
├── navigation/
├── calendar/
└── index.ts
```

---

# packages/types

Shared TypeScript types.

```txt
packages/types/
│
├── auth/
├── territories/
├── users/
├── carts/
├── schedules/
└── index.ts
```

---

# packages/validations

Shared Yup/Zod schemas.

```txt
packages/validations/
│
├── auth/
├── users/
├── territories/
├── schedules/
└── index.ts
```

---

# packages/services

Frontend API wrappers.

```txt
packages/services/
│
├── auth.service.ts
├── territory.service.ts
├── cart.service.ts
├── user.service.ts
└── index.ts
```

---

# Frontend Module Pattern

Each module MUST follow:

```txt
territories/
│
├── components/
├── hooks/
├── services/
├── schemas/
├── store/
├── types/
├── utils/
└── views/
```

---

# API Proxy Strategy

Frontend MUST communicate through internal Next.js API routes.

Pattern:

```txt
Client
↓
Next.js Route Handler
↓
NestJS API
↓
MySQL
```

---

# Route Handler Structure

```txt
app/api/
│
├── auth/
├── users/
├── territories/
├── carts/
├── schedules/
└── reports/
```

---

# State Management

# Zustand

Use for:

* Auth state
* UI state
* Filters
* Temporary state

---

# TanStack Query

Use for:

* Server state
* Caching
* Pagination
* Synchronization

---

# Design System

# UI Principles

MUST:

* Large buttons
* Large spacing
* High readability
* Minimal complexity
* Calm interfaces
* Mobile-first

MUST NOT:

* Dense layouts
* Dark mode
* Tiny fonts
* Complex navigation

---

# Recommended Font

Use:

* Inter
  or
* Plus Jakarta Sans

---

# Color Palette

```css
Primary: #1F4E79
Secondary: #4F81BD
Light Blue: #DCEEFF
Background: #F5F7FA
Border: #D9E2EC
Success: #5BAE7E
Warning: #E8C468
Danger: #D96C6C
White: #FFFFFF
```

---

# Infrastructure

# Docker Structure

```txt
infrastructure/docker/
│
├── admin.Dockerfile
├── site.Dockerfile
├── api.Dockerfile
└── docker-compose.yml
```

---

# Recommended Services

Use:

* Redis
* Queue workers
* MySQL
* Nginx
* Monitoring

---

# Queue System

Recommended:

* BullMQ
* Redis queues

For:

* Notifications
* Emails
* Reports
* Scheduled jobs

---

# Recommended Future Features

* PWA
* Offline mode
* Push notifications
* AI assistant
* GPS territories
* Smart schedules
* QR territory assignments

---

# Development Standards

# Naming

Components:
PascalCase

Hooks:
useSomething

Files:
kebab-case

---

# Principles

Code MUST:

* Be scalable
* Be reusable
* Be type-safe
* Be clean
* Be modular
* Be documented

---

# AI Instructions

When generating code:

* Prioritize readability
* Use feature/domain architecture
* Avoid duplicated logic
* Prefer reusable abstractions
* Use TypeScript strictly
* Keep components small
* Avoid massive files
* Separate business logic from UI
* Use clean architecture principles

---

# Final Goal

PrediGo should become a modern enterprise-level platform capable of organizing preaching activities for congregations worldwide while remaining extremely accessible and easy to use for users with little technical experience.
