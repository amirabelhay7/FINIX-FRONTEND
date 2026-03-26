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

