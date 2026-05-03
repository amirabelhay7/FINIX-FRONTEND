import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';

// SockJS/STOMP bundles may expect Node's `global` in the browser.
(window as typeof window & { global?: Window }).global = window;
(globalThis as typeof globalThis & { global?: typeof globalThis }).global = globalThis;

platformBrowser().bootstrapModule(AppModule, {

})
  .catch(err => console.error(err));
