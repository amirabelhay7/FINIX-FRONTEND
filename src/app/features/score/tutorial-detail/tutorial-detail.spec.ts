import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialDetail } from './tutorial-detail';

describe('TutorialDetail', () => {
  let component: TutorialDetail;
  let fixture: ComponentFixture<TutorialDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TutorialDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
