# Dev log (GhassenDhaoui branch)

Rule: **each small change** → **`ng build`** → **git commit** → add a short note here (**what + why**).

## 2026-03-26
- Enabled Tailwind processing (added `postcss.config.js` + Tailwind directives in `src/styles.css`) so seller module utility-class templates render correctly instead of appearing unstyled.
- Fixed `client` routing to properly lazy-load under the `Frontoffice` shell (avoid invalid `component` + `loadChildren` on the same route).
- Added `I18N_PLAN.md` to translate French → English systematically in small build+commit batches.
- Translated Seller shell UI (nav/topbar/modal labels) from French to English to keep the seller experience consistent.
- Standardized Seller layout modal defaults to English values (Gasoline/Manual) to avoid reintroducing French in new listing flow.
- Translated Admin sidebar navigation labels to English to remove French from the admin shell.
- Translated Admin topbar search + theme tooltips to English for consistency.
- Translated admin user-management validation/error messages to English to avoid French toasts in admin flows.
- Translated Admin overview (dashboard) labels and demo data to English so the main admin landing page is fully English.
- Translated Admin Clients page labels, loading/empty states, and table headers to English.
- Translated Admin Credits/Files page labels and analysis table headers/actions to English.
- Translated Admin Repayments page labels, filters, payment mode/status labels, and actions to English.
- Translated Admin Vehicles page labels, search placeholder, and table headers/actions to English.
- Translated Admin Insurance page labels, KPI captions, and renewal table headers to English.
- Translated Admin Risk/Notifications/Reports page headings and key labels to English.
- Translated Admin Settings page sections, forms, and toggles to English.
- Translated Admin Users page tabs, tables, and actions to English.
- Translated Admin modals (decision + add/edit/view user) to English to remove remaining French from admin flows.
- Translated Agent layout shell UI and navigation labels to English to remove French from agent experience.
- Translated Insurer layout shell (dashboard/offers/events/catalogs + modals) from French to English for a consistent insurer experience.
- Translated Frontoffice (client shell) topbar/nav/footer and dropdown labels to English to remove remaining French from client shell UI.
- Translated Client Dashboard UI strings to English (header, KPIs, tables, activity, alerts) to remove remaining French on the main client page.
- Translated Client Credits page labels, filters, cards, and actions to English to remove remaining French from credits UI.
- Translated Client Repayments page labels, calendar, and payment history table to English to remove French from repayments UI.
- Translated Client Vehicles page labels, vehicle cards, and catalog preview actions to English to remove French from vehicles UI.
- Translated Client Insurance page contracts + claims table labels to English to remove remaining French from insurance UI.
- Translated Client Wallet, Score, and Documents pages to English to remove remaining French from client feature pages.
- Cleaned up remaining French comments in Agent layout template to keep frontend fully English.
- Translated remaining French strings in shared services and admin shell templates (auth errors, interceptor comments, admin tables/settings, and backoffice CSS comments) to keep the whole frontend English.
- Finished cleaning a few leftover French labels/comments (repayments table headers, admin settings comments, backoffice CSS headings) to make the UI fully English.
- Replaced one leftover French word in Agent CSS comments ("Dossiers") to avoid French anywhere in the codebase UI layer.
- Removed Google Fonts `<link>` tags to make `ng build` work offline (avoids build-time font inlining fetch failures).
- Translated last French admin repayments section labels ("Remboursements", "Statut") to English to finish the UI text migration.
- Refactored `/admin` routing to use an `AdminShellComponent` + nested child routes (router-outlet) while keeping existing admin pages working, improving scalability for future features.
- Routed `/admin/users` to the dedicated `UsersModule` (nested lazy route) to start extracting admin pages into feature modules for better long-term maintainability.
- Routed `/admin/repayments` to the dedicated `RepaymentsAdminModule` to continue splitting admin sections into proper nested feature routes.
- Routed `/admin/vehicles` to the dedicated `VehiclesAdminModule` to modularize fleet management under admin nested routes.
- Routed `/admin/insurance` to the dedicated `InsuranceDeskModule` to extract insurance management into a proper nested admin feature module.
- Routed `/admin/risk` to the dedicated `ScoringAdminModule` to move risk/scoring into a dedicated nested admin feature module.
- Routed `/admin/credits` to the dedicated `CreditCenterModule` to extract credit center workflows into a nested admin feature module.
- Routed `/admin/rapports` to the dedicated `SteeringAdminModule` to extract reporting/steering views into a nested admin feature module.
- Routed `/admin/notifications` to the dedicated `MarketingAdminModule` to start modularizing alerts/notifications into a nested admin feature module.
- Extracted the admin clients page into a dedicated `AdminClients` component and routed `/admin/clients` to it, reducing reliance on the `BackofficeComponent` mega-template.
- Extracted the admin settings page into a dedicated `AdminSettings` component and routed `/admin/settings` to it, continuing the breakup of `BackofficeComponent`.
- Updated `BackofficeComponent` to behave as a routed admin dashboard page (no duplicated sidebar/topbar, no theme ownership) now that layout is handled by `AdminShellComponent`.
- Converted the admin sidebar navigation to router-native links (`routerLink`/`routerLinkActive`) so navigation state is URL-driven and deep-link friendly.
- Refactored `/agent` routing to use an `AgentShell` + nested child routes (router-outlet) loading `AgentModule`, aligning agent with the same scalable shell pattern used for client/seller/admin.
- Refactored `/insurer` routing to use nested child routes under an `InsurerShell`, replacing the old `:section` param route with canonical URLs like `/insurer/dashboard` for scalability.
- Cleanup: removed legacy seller URL aliases and dropped unused `AgentLayout` declarations/imports now that `/agent` uses the nested shell + feature module structure.
- Cleanup: made legacy `AgentLayout` standalone with proper `NgClass`/`NgFor`/`NgIf` imports so it no longer breaks builds even though it’s no longer used by routing.
- Hardened agent nested routing by adding a wildcard fallback in `AgentRoutingModule` so unknown `/agent/*` paths redirect to `/agent/dashboard`.
- Rebuilt `/forgot-password` using the same `finix-login` shell + `login.component.css` as the login page (SVG icons, no Material Symbols) so the screen matches auth styling and no longer looks broken offline.

## Backend (finix_Backend)
- Externalized Brevo API key and sender settings to env vars / optional `application-local.properties`; JWT uses env `JWT_SECRET` with a dev-only default; added example template and test overrides so secrets are not committed to GitHub.

## 2026-03-27
- Fixed forgot-password “Send reset link” spinning forever: backend RestTemplate now has connect/read timeouts and fails fast if Brevo is unconfigured; frontend uses RxJS `timeout`/`finalize` and surfaces API `message` on 500 errors.
- Highlighted the logged-in admin row in `/admin/users` (JWT `userId` match + subtle blue row accent) so admins can quickly spot their own account while managing users.
- Polished `/admin/users` search/filter toolbar (clean input, dynamic role options, clear button, result counter) so filtering is easier to use and visually consistent with the admin shell.
- Rebuilt `/admin/users/new` and `/admin/users/edit/:id` as a real admin form (create/update API wiring, load user by id, validation, loading/error/success states) to replace static mock fields and make the page production-usable.

