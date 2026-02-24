import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreHistory } from './score-history';

describe('ScoreHistory', () => {
  let component: ScoreHistory;
  let fixture: ComponentFixture<ScoreHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScoreHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
