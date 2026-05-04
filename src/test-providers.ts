import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export default [
  importProvidersFrom(RouterModule.forRoot([]), FormsModule),
  provideHttpClient(),
  provideHttpClientTesting(),
  provideCharts(withDefaultRegisterables()),
];
