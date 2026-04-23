# 💻 Code Documentation

> **Language**: TypeScript / React
> **Framework**: Vite
> **Styling**: Tailwind CSS

## 1. Project Overview

Nyay Netra is a robust, responsive point-of-sale and restaurant management application. It is built using modern React principles, ensuring components are reusable, state is well-managed, and the application is highly performant.

## 2. Core Concepts

### 2.1 Hooks vs Context

We utilize custom hooks (`src/hooks/useDatabase.ts`) backed by React Query to handle async operations and caching. Context (`src/contexts/TableContext.tsx`) is reserved strictly for global UI state that doesn't belong in the URL or server cache (e.g., active table session).

### 2.2 Component Hierarchy

```mermaid
graph TD
    App[App.tsx (Router)]
    
    subgraph Customer [Customer Flow]
        DinePage[DinePage]
        MenuPage[MenuPage]
        Rating[RatingFlow]
    end
    
    subgraph Captain [Captain Flow]
        CapDash[Captain Dashboard]
        Orders[Order Management]
    end
    
    subgraph Admin [Admin Flow]
        AdminDash[Admin Dashboard]
        Analytics[Analytics]
    end

    App --> DinePage
    App --> CapDash
    App --> AdminDash
    
    DinePage --> MenuPage
    MenuPage --> Rating
    CapDash --> Orders
```

## 3. Directory Guide

### `src/components/`
Contains reusable UI elements.
- `ui/`: Radix-UI/Shadcn UI primitives (Buttons, Inputs, Dialogs).
- `customer/`: Customer-facing components (Navbar, Cart).
- `admin/`: Admin-specific widgets (Charts, Tables).

### `src/hooks/`
Contains custom React hooks.
- `useDatabase.ts`: A centralized file containing all `@tanstack/react-query` hooks used to communicate with the Supabase backend.
- `use-toast.ts`: A custom hook for triggering UI toast notifications.

### `src/pages/`
Route-level components. Each folder represents a user role or distinct flow:
- `admin/`: Pages for management and analytics.
- `captain/`: Pages for waiters/captains to manage tables and KOTs.
- `customer/`: Pages for end-users to view menus and place orders.

## 4. Coding Standards

- **TypeScript Strict Mode**: All files must pass TypeScript compilation without `any` (unless absolutely necessary and commented).
- **ESLint**: Standard rules enforced to prevent unused variables and hook dependency issues.
- **Component Structure**: Functional components only. Default exports for Pages, named exports for Components and Hooks.

### 4.1 Naming Conventions

| Entity | Convention | Example |
| :--- | :--- | :--- |
| **Components** | PascalCase | `Button.tsx`, `RatingFlow.tsx` |
| **Hooks** | camelCase, prefixed with `use` | `useDatabase.ts`, `useAuth.ts` |
| **Types/Interfaces** | PascalCase | `TableSession`, `Order` |
| **Utility Functions** | camelCase | `formatCurrency()`, `cn()` |
