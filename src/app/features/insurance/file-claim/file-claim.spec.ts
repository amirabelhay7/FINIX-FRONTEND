import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileClaim } from './file-claim';

describe('FileClaim', () => {
  let component: FileClaim;
  let fixture: ComponentFixture<FileClaim>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileClaim]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileClaim);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
