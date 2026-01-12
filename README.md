# POS System

A modern, web-based Point of Sale system built with FastAPI and React.

## Features

- **Role Control**: Admin & Cashier roles.
- **Inventory**: Real-time stock management.
- **Billing**: Fast checkout with tax calculation.
- **WhatsApp Integration**: Share invoices via WhatsApp.
- **History**: View past sales.

## Quick Start

1.  Run `start_app.bat` to launch both servers.
2.  Open **http://localhost:5173** in your browser.
3.  Login with default credentials:
    - **Username:** `admin`
    - **Password:** `admin123`

## Tech Stack

- **Backend**: Python (FastAPI), SQLAlchemy, SQLite.
- **Frontend**: React (Vite), Vanilla CSS (Premium Dark Theme).

## Development

- **Backend**: `cd backend` -> `.venv\Scripts\activate` -> `uvicorn main:app --reload`
- **Frontend**: `cd frontend` -> `npm run dev`
