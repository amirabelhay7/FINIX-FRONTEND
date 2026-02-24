import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScoringDashboard } from './scoring-dashboard/scoring-dashboard';
import { Achievements } from './achievements/achievements';
import { Tutorials } from './tutorials/tutorials';
import { Guarantees } from './guarantees/guarantees';
import { ScoreHistory } from './score-history/score-history';
import { SavingsChallenge } from './savings-challenge/savings-challenge';
import { DocumentUpload } from './document-upload/document-upload';
import { TutorialDetail } from './tutorial-detail/tutorial-detail';
import { GuaranteeDetail } from './guarantee-detail/guarantee-detail';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ScoringDashboard },
      { path: 'savings-challenge', component: SavingsChallenge },
      { path: 'document-upload', component: DocumentUpload },
      { path: 'achievements', component: Achievements },
      { path: 'tutorials', component: Tutorials },
      { path: 'tutorials/:id', component: TutorialDetail },
      { path: 'guarantees', component: Guarantees },
      { path: 'guarantees/:id', component: GuaranteeDetail },
      { path: 'history', component: ScoreHistory }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScoreRoutingModule { }
