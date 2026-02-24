import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { List } from './list/list';
import { RulesList } from './rules-list/rules-list';
import { RuleForm } from './rule-form/rule-form';
import { TiersList } from './tiers-list/tiers-list';
import { TierForm } from './tier-form/tier-form';
import { TutorialsList } from './tutorials-list/tutorials-list';
import { AchievementsList } from './achievements-list/achievements-list';
import { GuaranteesList } from './guarantees-list/guarantees-list';

const routes: Routes = [
  { path: '', component: List },
  { path: 'rules', component: RulesList },
  { path: 'rules/new', component: RuleForm },
  { path: 'rules/edit/:id', component: RuleForm },
  { path: 'tiers', component: TiersList },
  { path: 'tiers/new', component: TierForm },
  { path: 'tiers/edit/:id', component: TierForm },
  { path: 'tutorials', component: TutorialsList },
  { path: 'achievements', component: AchievementsList },
  { path: 'guarantees', component: GuaranteesList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScoringAdminRoutingModule { }
