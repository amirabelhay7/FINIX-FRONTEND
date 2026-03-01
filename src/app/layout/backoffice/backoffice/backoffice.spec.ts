import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackofficeComponent } from './backoffice.component';

describe('Backoffice', () => {
  let component: BackofficeComponent;
  let fixture: ComponentFixture<BackofficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackofficeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackofficeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
