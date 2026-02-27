import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { List } from './list/list';
import { RulesList } from './rules-list/rules-list';
import { RuleForm } from './rule-form/rule-form';
import { TiersList } from './tiers-list/tiers-list';
import { TierForm } from './tier-form/tier-form';
import { TutorialsList } from './tutorials-list/tutorials-list';
import { TutorialForm } from './tutorial-form/tutorial-form';
import { TutorialDetail } from './tutorial-detail/tutorial-detail';
import { AchievementsList } from './achievements-list/achievements-list';
import { AchievementForm } from './achievement-form/achievement-form';
import { AchievementDetail } from './achievement-detail/achievement-detail';
import { GuaranteesList } from './guarantees-list/guarantees-list';
import { GuaranteeDetail } from './guarantee-detail/guarantee-detail';
import { GuaranteeCreateAdmin } from './guarantee-create/guarantee-create-admin';
import { DocumentsList } from './documents-list/documents-list';

const routes: Routes = [
  { path: '', component: List },
  { path: 'rules', component: RulesList },
  { path: 'rules/new', component: RuleForm },
  { path: 'rules/edit/:id', component: RuleForm },
  { path: 'tiers', component: TiersList },
  { path: 'tiers/new', component: TierForm },
  { path: 'tiers/edit/:id', component: TierForm },
  { path: 'tutorials', component: TutorialsList },
  { path: 'tutorials/new', component: TutorialForm },
  { path: 'tutorials/:id', component: TutorialDetail },
  { path: 'achievements', component: AchievementsList },
  { path: 'achievements/new', component: AchievementForm },
  { path: 'achievements/edit/:id', component: AchievementForm },
  { path: 'achievements/:id', component: AchievementDetail },
  { path: 'guarantees', component: GuaranteesList },
  { path: 'guarantees/create', component: GuaranteeCreateAdmin },
  { path: 'guarantees/:id', component: GuaranteeDetail },
  { path: 'documents', component: DocumentsList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScoringAdminRoutingModule { }
