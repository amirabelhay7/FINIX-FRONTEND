# Dev log (GhassenDhaoui branch)

Rule: **each small change** → **`ng build`** → **git commit** → add a short note here (**what + why**).

## 2026-03-26
- Enabled Tailwind processing (added `postcss.config.js` + Tailwind directives in `src/styles.css`) so seller module utility-class templates render correctly instead of appearing unstyled.
- Fixed `client` routing to properly lazy-load under the `Frontoffice` shell (avoid invalid `component` + `loadChildren` on the same route).
- Added `I18N_PLAN.md` to translate French → English systematically in small build+commit batches.
- Translated Seller shell UI (nav/topbar/modal labels) from French to English to keep the seller experience consistent.
- Standardized Seller layout modal defaults to English values (Gasoline/Manual) to avoid reintroducing French in new listing flow.

