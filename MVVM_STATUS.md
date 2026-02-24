# MVVM status – FINIX frontend

All UIs should follow **MVVM**: data and commands in the ViewModel (`.ts`), view (`.html`) only binds (`{{ }}`, `*ngFor`, `[ngClass]`, `(click)`, `[routerLink]`). Models live in `src/app/models/`.

## Done (ViewModel holds data, view binds)

- **Admin:** marketing-admin (list hub, segments-list, campaigns-list, events-list), users/list, user-form, user-detail, credit-center (list hub, loan-requests-list, contracts-list), steering-admin (list hub, treasury-list, indicators-list, simulations-list), repayments-admin (list hub, payments-list, schedules-list, delinquency-list, grace-list, recovery-list, penalties-list, payment-detail), vehicles-admin (list hub, vehicles-list, deliveries-list), insurance-desk (list hub, claims-list, policies-list, products-list), scoring-admin (list hub, rules-list, rule-form, tiers-list, tier-form, tutorials-list, achievements-list, guarantees-list), wallet-admin (list hub, wallet-list, wallet-detail, transaction-list, transaction-detail)
- **Wallet:** wallet-home, transactions, deposit, withdraw, transfer, agent-top-up, transaction-detail
- **Credit:** my-loans, loan-apply, active-contract, application-status, down-payment, upload-contract, loan-detail
- **Insurance:** products, my-policies, quote, file-claim, policy-detail, my-claims, product-detail, claim-detail
- **Vehicles:** my-vehicles, vehicle-detail
- **Repayment:** schedule, payment-history, delinquency, payment-detail
- **Profile:** my-profile, kyc, login-history
- **Agent:** dashboard, clients, top-up, loan-verification, client-detail
- **Score:** scoring-dashboard, guarantees, savings-challenge, document-upload, guarantee-detail, tutorial-detail
- **Auth:** login, forgot-password
- **Seller:** dashboard, orders, listings, listing-detail, listing-form, order-detail
- **Landing:** landing-page (hero + trust strip)
- **Dashboard:** (main) dashboard (header)

## To do (move copy/lists to ViewModel, bind in template)

- **Score:** score-history, achievements, tutorials (data and filters already in VM; optional: move more labels to VM)

## Models and interfaces (MVVM)

All ViewModel data is typed with **interfaces** from `src/app/models/` (e.g. `WalletBalance`, `QuickAction`, `WalletTransaction`). This keeps a clear contract between View and ViewModel and improves type safety.

- **Current layout:** one file per domain (`wallet.model.ts`, `credit.model.ts`, …) with multiple interfaces; barrel export in `models/index.ts`.
- **Adding new types:** you can use Angular CLI for a single-interface file:  
  `ng generate interface models/<name>` (e.g. `ng g i models/payment-card`) creates `src/app/models/<name>.ts`. Alternatively add the new interface to the existing domain file (e.g. `wallet.model.ts`) and export from `index.ts`.

## Import path from features

From `features/<area>/<feature>/component.ts`: use `../../../models` (3 levels to `app`).  
From `features/<area>/<sub>/<feature>/component.ts`: use `../../../../models` (4 levels to `app`).
