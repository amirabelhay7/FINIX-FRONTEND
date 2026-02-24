import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignsList } from './campaigns-list';

describe('CampaignsList', () => {
  let component: CampaignsList;
  let fixture: ComponentFixture<CampaignsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CampaignsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
