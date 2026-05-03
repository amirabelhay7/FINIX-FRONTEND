# InfinixFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# FIN'IX Frontend

## Overview

FIN'IX is a web platform designed for **Microfinance Institutions (IMF)** to manage their core operations: credit origination, loan repayment tracking, insurance, vehicle fleet management, digital wallets, and client scoring. The frontend provides role-based dashboards for administrators, agents, sellers, insurers, and clients.

## Features

- **Authentication & Authorization** -- JWT-based login with role guards (Admin, Agent, Seller, Insurer, Client)
- **Credit Management** -- Loan contract creation, amortization schedule generation, and document handling
- **Repayment Tracking** -- Interactive installment ticket, Stripe card payments, payment history, and PDF export
- **Penalty Engine** -- Tiered IMF penalty system (TIER 1/2/3) with grace period integration, displayed in the payment ticket and calendar
- **Grace Period Requests** -- Clients can request payment delays with supporting documents; admin approval workflow
- **Calendar Tracker** -- Monthly calendar view with color-coded payment statuses (on-time, tolerance, late, overdue)
- **Insurance Module** -- Policy management and insurer partnership dashboard
- **Vehicle Management** -- Delivery vehicle tracking with GPS tracer integration
- **Digital Wallet** -- Client wallet operations and balance management
- **Client Scoring** -- Credit scoring and risk assessment interface
- **Multi-layout Dashboards** -- Dedicated layouts for backoffice (admin), client, agent, seller, and insurer
- **Dark Mode** -- Full dark theme support across all components
- **Responsive Design** -- Mobile-friendly layouts using Bootstrap 5 grid and custom CSS

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21.1.0 | Core framework |
| TypeScript | 5.9.2 | Type-safe development |
| Angular Material | 21.1.3 | UI components |
| Bootstrap | 5.3.8 | Grid system and utilities |
| Tailwind CSS | 3.4.19 | Utility-first styling |
| RxJS | 7.8.0 | Reactive state management |
| Stripe.js | CDN | Secure card payment processing |
| Font Awesome | 7.2.0 | Icon library |
| Vitest | 4.0.8 | Unit testing |

## Architecture

```
src/app/
  |-- features/              # Feature modules
  |   |-- admin/             # Admin management panels
  |   |-- agent/             # Field agent interface
  |   |-- auth/              # Login, registration
  |   |-- client/            # Client dashboard & repayments
  |   |-- credit/            # Loan contracts & amortization
  |   |-- dashboard/         # Analytics & KPIs
  |   |-- insurance/         # Insurance policies
  |   |-- landing-page/      # Public landing page
  |   |-- profile/           # User profile management
  |   |-- repayment/         # Repayment management (backoffice)
  |   |-- score/             # Client scoring
  |   |-- seller/            # Seller dashboard
  |   |-- vehicles/          # Vehicle fleet management
  |   |-- wallet/            # Digital wallet
  |
  |-- layout/                # Role-based layouts
  |   |-- backoffice/        # Admin layout (sidebar + header)
  |   |-- frontoffice/       # Client layout
  |   |-- agent/             # Agent layout
  |   |-- seller/            # Seller layout
  |   |-- insurer/           # Insurer layout
  |
  |-- services/              # Shared Angular services
  |   |-- auth.service       # JWT auth & token management
  |   |-- credit.service     # Loan contracts, installments, Stripe, penalties
  |   |-- grace-period-request.service
  |   |-- insurance.service
  |   |-- repayment.service
  |   |-- score.service
  |   |-- user.service
  |   |-- vehicle.service
  |   |-- wallet.service
  |
  |-- app-routing-module.ts  # Role-based routing with lazy loading
  |-- app-module.ts          # Root NgModule
```

## Contributors

| Name | Role |
|---|---|
| Emna Makni | Repayment & Recovery module |
| Amira Belhay | Loan & Event module |
| Koussay Ben Attia | Vehicle & ? module |
| Ghassen Dhaoui | Digital Wallet & Client Scoring module |
| Taha Yessine Kouas | Insurance & ? module |
| Yosra Bakri | Marketing & Steering module |




## Academic Context

This project was developed as part of the **Projet d'Integration (PI)** at **ESPRIT** (Ecole Superieure Privee d'Ingenierie et de Technologies), Tunis. It serves as a full-stack microfinance management platform covering credit, repayment, insurance, vehicle tracking, and digital wallet functionalities.

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 10.x
- Angular CLI >= 21.x

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the frontend directory
cd FINIX-FRONTEND

# Install dependencies
npm install

# Start the development server
ng serve
```

The application will be available at `http://localhost:4200`.

### Environment

En dev avec `ng serve`, les appels `/api/*` sont proxifiés vers `http://localhost:8082` (`proxy.conf.json`). Démarrez le backend sur ce port avant d’utiliser l’API (auth, paiements, etc.).

### Stripe Integration

Stripe.js is loaded via CDN in `index.html`. For local testing, run the Stripe webhook listener:

```bash
stripe listen --forward-to localhost:8082/api/stripe/webhook
```

## Acknowledgments

- **ESPRIT** -- Academic supervision and project framework
- **Stripe** -- Payment processing infrastructure
- **Angular Team** -- Frontend framework
- **Spring Boot** -- Backend framework
