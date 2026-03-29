import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignsListComponent } from './campaigns-list';

describe('CampaignsList', () => {
  let component: CampaignsListComponent;
  let fixture: ComponentFixture<CampaignsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignsListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
