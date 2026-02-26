import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Scoring } from './scoring';
import { ScoringRoutingModule } from './scoring-routing.module';

@NgModule({
  declarations: [Scoring],
  imports: [CommonModule, ScoringRoutingModule],
})
export class ScoringModule {}

