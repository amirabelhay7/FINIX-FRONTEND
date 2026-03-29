import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';

import { enableProdMode } from '@angular/core';
enableProdMode();

platformBrowser().bootstrapModule(AppModule)
  .catch(err => console.error(err));
