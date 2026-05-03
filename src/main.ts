import 'zone.js';

import { platformBrowser } from '@angular/platform-browser';

// Some realtime dependencies expect Node's `global`.
// Provide a browser-safe alias before app modules are evaluated.
if (typeof (globalThis as { global?: unknown }).global === 'undefined') {
  (globalThis as { global?: unknown }).global = globalThis;
}

import('./app/app-module')
  .then(({ AppModule }) =>
    platformBrowser().bootstrapModule(AppModule, {})
  )
  .catch((err) => console.error(err));
