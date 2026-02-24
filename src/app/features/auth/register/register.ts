import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  currentStep = 1;
  selectedRole = '';

  // Step 1: Personal info
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  phone = '';
  dateOfBirth = '';
  cin = '';
  address = '';
  city = '';

  // Step 3: Role-specific
  localisation = '';
  agenceCode = '';
  region = '';
  commercialRegister = '';
  insurerName = '';
  insurerEmail = '';

  constructor(private router: Router) { }

  nextStep() {
    if (this.currentStep < 3) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  selectRole(role: string) {
    this.selectedRole = role;
  }

  onSubmit() {
    // Placeholder — will connect to AuthService
    console.log('Register submitted', {
      firstName: this.firstName,
      role: this.selectedRole,
    });
  }
}
