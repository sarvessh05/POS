# 🌶️ Spice Haven | Next-Gen Restaurant POS Ecosystem

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Spice Haven** is a high-performance, full-stack Point of Sale (POS) and Restaurant Management System designed for precision, speed, and luxury. Built with a modern tech stack, it provides a seamless experience for customers, waitstaff (Captains), and administrators.

---

## 🏛️ System Architecture

The ecosystem is divided into three specialized portals, each optimized for its specific user base:

### 1. 🍽️ Customer Experience Portal
A premium "Store Front" where diners can explore the menu with high-fidelity visuals and interactive elements.
- **Dynamic Menu**: Real-time category filtering and search.
- **Smart Cart & Add-ons**: Customizable dish options with real-time price updates.
- **Interactive Split Bill**: A unique, physics-based bill splitting animation for groups.
- **Loyalty Program**: Tiered rewards and points tracking for returning guests.
- **Table Booking**: Real-time availability checks and instant confirmation.

### 2. 👨‍✈️ Captain's Command Dashboard
A tactical interface for waitstaff to manage the floor efficiently.
- **Live Order Tracking**: Instant notifications throughout the preparation lifecycle.
- **Table Management**: Visual status indicators for every table in the house.
- **Role-Based Access**: Secure login and flow optimized for rapid order taking.
- **KOT Management**: Digital Kitchen Order Tickets for seamless kitchen communication.

### 3. 📊 Admin Intelligence Suite
The core brain of the operation, providing deep insights and control.
- **Revenue Analytics**: Daily, weekly, and monthly financial performance tracking.
- **Menu Orchestration**: Add, edit, or disable dishes and categories on the fly.
- **Waitlist & Booking Management**: Centralized control over all guest reservations.
- **Performance Metrics**: Identify top-performing dishes and peak hour trends.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Core** | React 18 + TypeScript |
| **Build System** | Vite (Ultra-fast HMR) |
| **Database/Auth** | Supabase (PostgreSQL with Real-time) |
| **Styling** | Vanilla CSS + Tailwind + Framer Motion |
| **UI Components** | Radix UI + shadcn/ui |
| **State/Data** | TanStack Query + Zod Validation |

---

## 🚀 Key Innovations

### 🎭 Animation & Interaction
Leveraging `Framer Motion` for a "living" UI, including:
- **Torn Receipt Animation**: A physics-based simulation when splitting bills.
- **Glassmorphism Design**: High-end aesthetic with frosted glass effects and neon accents.
- **Micro-interactions**: Hover states, smooth transitions, and tactile feedback.

### ⚡ Real-time Synchronization
Powered by Supabase Broadcast, ensuring that:
- Captains see orders the second they are placed.
- Kitchen status updates reflect instantly on the customer's phone.
- Admin stats update without page refreshes.

---

## 📦 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Supabase Account**: For database and authentication

### Installation
1. **Clone & Enter**
   ```bash
   git clone https://github.com/yourusername/spice-haven-pos.git
   cd spice-haven-pos
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Launch**
   ```bash
   npm run dev
   ```

---

## 🗺️ Project Structure

Our codebase strictly follows **Clean Architecture** principles to separate business logic from UI components.

```text
src/
├── assets/          # High-fidelity food and brand assets
├── components/      # Atomic UI units and composite layouts (Presentation)
├── contexts/        # Auth, Cart, and Theme providers (Application)
├── data/            # Mock schemas and static content
├── hooks/           # Business logic and queries (Application)
├── lib/             # Utility functions and API clients (Domain)
├── pages/           # Portal-specific route components (Presentation)
├── services/        # Backend communication & Data Access (Infrastructure)
└── types/           # Strict TypeScript interfaces (Domain)
```

## 📚 Comprehensive Documentation

For an in-depth understanding of the system, please refer to our dedicated `documents/` directory:

- 🏛️ [Architecture & Design Docs](documents/Architecture_Design.md)
- 🔌 [API Documentation](documents/API_Documentation.md)
- 💻 [Code Documentation](documents/Code_Documentation.md)
- 🧪 [Testing Documentation](documents/Testing_Documentation.md)
- 📄 [LICENSE](documents/LICENSE.md)

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for the future of hospitality.

