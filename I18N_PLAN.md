# Frontend French → English migration plan

Goal: remove remaining French UI text and keep future strings consistent.

## Strategy (systematic)
- **Inventory first**: list every file with French user-facing strings (templates + TS).
- **Prioritize by exposure**:
  1) Auth + role layouts (login/register/forgot + shells)
  2) Client core pages (dashboard/credits/repayments/vehicles/insurance/wallet/score/docs)
  3) Admin + agent + insurer + seller feature pages
  4) Leftovers (placeholders, error toasts, empty states, labels)
- **Translate in small batches** (one feature area at a time), each batch:
  - update strings
  - `ng build`
  - commit
  - add one line in `DEVLOG.md`

## Recommended best practice (after MVP cleanup)
Move hardcoded strings into a translation system to avoid reintroducing French:
- Option A: **Angular i18n** (compile-time, multiple builds)
- Option B: **ngx-translate** (runtime, easiest for incremental migration)

For now, we can finish the MVP cleanup by translating hardcoded strings first, then decide if we want to adopt i18n tooling.

## Initial inventory (from grep)
These were detected as likely containing French UI text (non-exhaustive; we’ll keep updating this list):
- `src/app/layout/backoffice/backoffice.component.*`
- `src/app/layout/backoffice/components/sidebar/sidebar.component.html`
- `src/app/layout/agent/agent.html`
- `src/app/layout/insurer/insurer.html`
- `src/app/layout/seller/seller.html`
- `src/app/features/auth/*`
- `src/app/features/client/*/*.html`
- `src/app/features/wallet/*`
- `src/app/features/score/*`

