import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyClaims } from './my-claims';

describe('MyClaims', () => {
  let component: MyClaims;
  let fixture: ComponentFixture<MyClaims>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyClaims]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyClaims);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
