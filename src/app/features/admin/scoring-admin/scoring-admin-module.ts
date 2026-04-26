import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ScoringAdminRoutingModule } from './scoring-admin-routing-module';
import { List } from './list/list';
import { RulesList } from './rules-list/rules-list';
import { RuleForm } from './rule-form/rule-form';
import { TiersList } from './tiers-list/tiers-list';
import { TierForm } from './tier-form/tier-form';
import { TutorialsList } from './tutorials-list/tutorials-list';
import { AchievementsList } from './achievements-list/achievements-list';
import { GuaranteesList } from './guarantees-list/guarantees-list';


@NgModule({
  declarations: [
    List,
    RulesList,
    RuleForm,
    TiersList,
    TierForm,
    TutorialsList,
    AchievementsList,
    GuaranteesList
  ],
  imports: [
    CommonModule,
    RouterModule,
    ScoringAdminRoutingModule
  ]
})
export class ScoringAdminModule { }
