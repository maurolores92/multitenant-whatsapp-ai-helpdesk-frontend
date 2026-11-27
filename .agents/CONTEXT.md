# PrediGo — Complete Product Analysis & Project Context

# Executive Summary

PrediGo is a modern multi-congregation preaching management platform designed to organize and simplify all operational aspects related to Christian preaching activities.

The system is intended for users of all ages, including elderly users with limited technological experience. Therefore, simplicity, accessibility, clarity, and ease of use are critical requirements.

PrediGo centralizes the administration and coordination of:

* House-to-house preaching
* Telephone preaching
* Cart witnessing
* Territory management
* Volunteer coordination
* Scheduling
* Congregation administration
* Reporting and analytics

The platform must work primarily on mobile devices while also providing a robust desktop administration experience.

---

# Primary Business Goals

The platform aims to solve several operational problems currently handled manually or through disconnected tools.

## Main Goals

### 1. Simplify territory organization

Reduce manual territory assignments and tracking.

### 2. Improve preaching coordination

Allow faster organization of preaching activities.

### 3. Improve visibility

Provide congregation overseers with real-time operational visibility.

### 4. Reduce complexity for elderly users

Create interfaces simple enough for non-technical users.

### 5. Centralize operations

Unify all preaching activities under one platform.

### 6. Scale globally

Support multiple congregations and future international scaling.

---

# Core Product Vision

PrediGo should feel:

* calm
* organized
* trustworthy
* accessible
* lightweight
* modern
* intuitive

The system should NEVER feel:

* overwhelming
* overly technical
* corporate-heavy
* visually dense
* difficult to navigate

---

# Target Users

## Elderly Users

Many users will have limited technical experience.

The platform MUST prioritize:

* readability
* large buttons
* simple flows
* visual clarity

---

## Younger Publishers

Need fast mobile interactions and scheduling.

---

## Congregation Administrators

Need organizational visibility and operational control.

---

# Product Philosophy

The platform should behave like:

* a modern productivity app
* a calm organizational assistant
* an easy-to-use coordination platform

NOT like:

* an ERP
* a complex enterprise dashboard
* a technical administration system

---

# Main Functional Domains

The platform consists of 6 major operational domains:

1. Authentication & Access Control
2. Congregation Management
3. Territory Management
4. Telephone Preaching
5. Cart Witnessing
6. Scheduling & Reporting

---

# Multi-Congregation System

## Overview

The platform MUST support multiple congregations from the beginning.

Each congregation operates independently while being managed under a shared platform infrastructure.

---

## Congregation Isolation

Every congregation has:

* users
* territories
* schedules
* volunteers
* statistics
* reports
* notifications

Data MUST remain isolated per congregation.

---

## Congregation Roles

### Super Admin

Platform-level access.

### Congregation Admin

Manages one congregation.

### Elder / Coordinator

Coordinates congregation activities.

### Territory Overseer

Manages territory assignments.

### Cart Overseer

Manages cart witnessing.

### Publisher

Regular preaching participant.

### Volunteer

Authorized cart witnessing participant.

---

# Authentication & Security

## Authentication Model

The platform uses:

* JWT access tokens
* refresh tokens
* HttpOnly cookies

---

## Security Goals

* secure session management
* role-based authorization
* congregation isolation
* audit logging
* protected routes
* token refresh flow

---

# House-to-House Preaching Domain

# Territory System

Territories represent geographical preaching areas.

Each territory includes:

* territory code
* name
* zone
* streets
* blocks
* assigned user
* assignment date
* completion status
* historical activity
* notes

---

# Territory Types

## Personal Territory

Assigned directly to a publisher.

## Group Territory

Assigned to a conductor or preaching group.

---

# Territory Status Lifecycle

1. Available
2. Assigned
3. In Progress
4. Completed
5. Under Review

---

# Territory Operations

Users must be able to:

* request territories
* assign territories
* return territories
* complete territories
* review territory history

---

# Territory Visualization

The system should support:

* card views
* list views
* future map integration

Future roadmap:

* interactive maps
* polygons
* geolocation

---

# Telephone Preaching Domain

# Objective

Allow publishers to organize and manage telephone witnessing efficiently.

---

# Phone Record Structure

Each record includes:

* phone number
* assigned publisher
* status
* notes
* revisit date
* call history

---

# Call Result States

* Answered
* No Answer
* Out of Service
* Do Not Call Again
* Revisit Later

---

# UX Requirements

This module MUST:

* minimize clicks
* prioritize speed
* use large buttons
* allow one-touch updates

---

# Cart Witnessing Domain

# Objective

Coordinate public witnessing through carts.

---

# Main Concepts

## Cart Locations

Physical preaching locations.

## Storage Locations

Places where carts are stored.

## Shifts

Scheduled preaching periods.

## Volunteers

Authorized users.

---

# Shift Rules

* Maximum 3 volunteers
* Minimum 2 volunteers required

---

# Shift Lifecycle

1. Available
2. Reserved
3. Confirmed
4. Completed
5. Cancelled

---

# Cart Overseer Capabilities

Can:

* cancel shifts
* disable schedules
* disable locations
* suspend activities
* manage volunteers

---

# Scheduling Domain

# Objective

Centralize organizational scheduling.

---

# Scheduling Features

* weekly calendar
* recurring schedules
* conflict detection
* shift management
* activity reminders
* congregation schedules

---

# Notifications System

The platform should support:

* assignment notifications
* reminders
* announcements
* activity updates
* cancellations

Future:

* push notifications
* email notifications
* WhatsApp integration

---

# Dashboard System

# Mobile Dashboard

Prioritize:

* next activity
* assigned territories
* cart shifts
* notifications
* quick actions

---

# Desktop Dashboard

Prioritize:

* congregation metrics
* reports
* operational visibility
* user activity
* territory metrics

---

# Reporting Domain

# Reports Should Include

* territory completion
* volunteer participation
* preaching activity
* schedule participation
* congregation activity
* assignment history

---

# Accessibility Requirements

This is one of the MOST important aspects of the platform.

The system MUST:

* support elderly users
* use high contrast
* use large touch targets
* use readable typography
* reduce complexity
* minimize cognitive load

---

# Mobile-First Requirement

The application is primarily mobile.

Desktop is secondary.

The mobile experience MUST feel native-like.

---

# UI/UX Design Guidelines

# Visual Style

The interface should feel:

* peaceful
* organized
* spacious
* modern
* lightweight

---

# Design Inspiration

Inspired by:

* Notion
* Google Workspace
* Trello
* modern banking apps
* accessibility-first apps

---

# UI Rules

## MUST

* large spacing
* rounded corners
* large typography
* clear visual hierarchy
* soft shadows
* clean layouts

## MUST NOT

* dark mode
* cluttered screens
* tiny buttons
* excessive animations
* dense tables on mobile

---

# Color Palette

Primary:
#1F4E79

Secondary:
#4F81BD

Light Blue:
#DCEEFF

Background:
#F5F7FA

Border:
#D9E2EC

Success:
#5BAE7E

Warning:
#E8C468

Danger:
#D96C6C

White:
#FFFFFF

---

# Technical Architecture

# Frontend

* Next.js 15
* React 19
* TypeScript
* Material-UI (MUI)
* Zustand
* TanStack Query
* React Hook Form
* Yup

---

# Backend

* NestJS
* Sequelize
* MySQL
* JWT Authentication

---

# Infrastructure

* Docker
* Redis
* Queue workers
* Nginx

---

# Monorepo Structure

The project contains:

* admin app
* site app
* backend API
* shared packages

---

# API Architecture

Frontend MUST communicate through:

* Next.js route handlers
* proxy layer

NOT directly to NestJS.

---

# Reasoning

Benefits:

* security
* token handling
* refresh handling
* centralized API management
* SSR support

---

# Development Principles

Code MUST:

* be scalable
* be modular
* be reusable
* be type-safe
* follow clean architecture
* avoid duplication

---

# Frontend Architecture

Use:

* domain-driven structure
* reusable modules
* isolated feature folders

---

# Backend Architecture

Use:

* NestJS modular architecture
* service layer
* repository pattern
* DTO validation
* guards
* RBAC

---

# State Management

## Zustand

Used for:

* auth state
* UI state
* filters

## TanStack Query

Used for:

* server state
* caching
* synchronization

---

# Future Roadmap

Potential future features:

* PWA
* Offline support
* Push notifications
* GPS territories
* Interactive maps
* QR territory assignments
* AI assistant
* Smart scheduling
* Analytics dashboards

---

# Final Product Objective

PrediGo should become a highly accessible global preaching coordination platform capable of serving congregations of any size while remaining extremely simple and comfortable for users with limited technical knowledge.

The system should feel:

* effortless
* calm
* reliable
* modern
* human-centered
