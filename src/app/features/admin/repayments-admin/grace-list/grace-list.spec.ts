import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraceList } from './grace-list';

describe('GraceList', () => {
  let component: GraceList;
  let fixture: ComponentFixture<GraceList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [GraceList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraceList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
