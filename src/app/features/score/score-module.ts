import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ScoreRoutingModule } from './score-routing-module';
import { ScoringDashboard } from './scoring-dashboard/scoring-dashboard';
import { Achievements } from './achievements/achievements';
import { Tutorials } from './tutorials/tutorials';
import { Guarantees } from './guarantees/guarantees';
import { ScoreHistory } from './score-history/score-history';
import { SavingsChallenge } from './savings-challenge/savings-challenge';
import { DocumentUpload } from './document-upload/document-upload';
import { TutorialDetail } from './tutorial-detail/tutorial-detail';
import { GuaranteeDetail } from './guarantee-detail/guarantee-detail';
import { GuaranteeCreate } from './guarantee-create/guarantee-create';

@NgModule({
  declarations: [
    ScoringDashboard,
    Achievements,
    Tutorials,
    Guarantees,
    ScoreHistory,
    SavingsChallenge,
    DocumentUpload,
    TutorialDetail,
    GuaranteeDetail,
    GuaranteeCreate
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ScoreRoutingModule
  ],
  exports: [
    ScoringDashboard,
    Achievements,
    Tutorials,
    Guarantees,
    ScoreHistory
  ]
})
export class ScoreModule { }
