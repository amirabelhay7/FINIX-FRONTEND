import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginClient } from './login-client';

describe('LoginClient', () => {
  let component: LoginClient;
  let fixture: ComponentFixture<LoginClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [LoginClient],
      imports: [RouterModule.forRoot([]), FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginClient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
