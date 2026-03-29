import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignDetailComponent } from './campaign-detail';

describe('CampaignDetail', () => {
  let component: CampaignDetailComponent;
  let fixture: ComponentFixture<CampaignDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
