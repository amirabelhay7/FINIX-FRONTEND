import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ScoringAdminRoutingModule } from './scoring-admin-routing-module';
import { List } from './list/list';
import { RulesList } from './rules-list/rules-list';
import { RuleForm } from './rule-form/rule-form';
import { TiersList } from './tiers-list/tiers-list';
import { TierForm } from './tier-form/tier-form';
import { TutorialsList } from './tutorials-list/tutorials-list';
import { TutorialForm } from './tutorial-form/tutorial-form';
import { TutorialDetail } from './tutorial-detail/tutorial-detail';
import { AchievementsList } from './achievements-list/achievements-list';
import { AchievementDetail } from './achievement-detail/achievement-detail';
import { GuaranteesList } from './guarantees-list/guarantees-list';
import { GuaranteeDetail } from './guarantee-detail/guarantee-detail';
import { DocumentsList } from './documents-list/documents-list';

@NgModule({
  declarations: [
    List,
    RulesList,
    RuleForm,
    TiersList,
    TierForm,
    TutorialsList,
    TutorialForm,
    TutorialDetail,
    AchievementsList,
    AchievementDetail,
    GuaranteesList,
    GuaranteeDetail,
    DocumentsList
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ScoringAdminRoutingModule
  ]
})
export class ScoringAdminModule { }
