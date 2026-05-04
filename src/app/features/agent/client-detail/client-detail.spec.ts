import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDetail } from './client-detail';

describe('ClientDetail', () => {
  let component: ClientDetail;
  let fixture: ComponentFixture<ClientDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ClientDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
