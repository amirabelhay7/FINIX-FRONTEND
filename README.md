# FINIX – Microfinance Platform Frontend
## Overview
This project was developed as part of the PIDEV – 3rd Year Engineering Program at **Esprit School of Engineering** (Academic Year 2025–2026).
It consists of a full-stack web application frontend that provides microfinance services, allowing unbanked people to access micro-credit loans with vehicles as collateral, using alternative scoring methods.

## Key Features
- **Vehicle Management**: Browse and manage vehicle listings for collateral
- **Credit System**: Apply for micro-credit loans with vehicle collateral
- **User Roles**: Customer, Seller, Agent, and Admin interfaces
- **Digital Wallet**: Manage payments and installments
- **Scoring System**: Alternative credit scoring using documents and behavior
- **Real-time Notifications**: WebSocket-based notifications system

## Tech Stack
- **Angular 21** - Frontend framework
- **Angular Material** - UI component library
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **Bootstrap** - Additional CSS framework
- **ApexCharts** - Data visualization
- **WebSocket** - Real-time communication

## Project Structure
```
src/app/
├── features/          # Feature modules
│   ├── admin/         # Admin dashboard
│   ├── agent/         # Agent verification tools
│   ├── auth/          # Authentication
│   ├── client/        # Customer interface
│   ├── credit/        # Credit management
│   ├── seller/        # Seller vehicle management
│   ├── vehicles/      # Vehicle listings
│   └── wallet/        # Digital wallet
├── core/              # Core services and interceptors
├── layout/            # Layout components
├── models/            # Data models
├── services/          # API services
└── shared/            # Shared components
```

## Development Server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running Unit Tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Academic Context
Developed at *Esprit School of Engineering – Tunisia*
PIDEV – 3A | 2025–2026
