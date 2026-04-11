# Spice Haven - Fine Dining Restaurant

A modern, responsive web application for Spice Haven, a fine dining restaurant specializing in authentic Indian cuisine.

## Features

- **Store Front**: Browse our extensive menu of authentic flavors.
- **Online Ordering**: Conveniently order your favorite dishes online.
- **Table Booking**: Reserve your table with ease.
- **Exclusive Rewards**: Join our loyalty program for special offers and rewards.
- **Mobile Responsive**: Optimized for all devices.

## Tech Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & shadcn/ui
- **Backend Integration**: Supabase
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/components`: Reusable UI components.
- `src/pages`: Main application pages.
- `src/hooks`: Custom React hooks.
- `src/integrations`: Service integrations (e.g., Supabase).
- `src/lib`: Utility functions and shared libraries.

## License

This project is licensed under the MIT License.
