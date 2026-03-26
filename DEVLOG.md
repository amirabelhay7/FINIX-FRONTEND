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

