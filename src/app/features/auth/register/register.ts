import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { RegisterRequest } from '../../../models';

/** Role option for step 2 (MVVM: copy in VM). */
interface RegisterRoleOption {
  value: string;
  title: string;
  description: string;
  icon: string;
}

/**
 * ViewModel: register (MVVM).
 * Wired to AuthService.register; only CLIENT and SELLER can register (invite-only for AGENT/INSURER/ADMIN).
 */
@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  currentStep = 1;
  selectedRole = '';
  loading = false;
  errorMessage = '';

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

  // Step 3: Role-specific (CLIENT: localisation; SELLER: commercialRegister)
  localisation = '';
  commercialRegister = '';

  /** Static copy for left panel steps. */
  readonly stepsCopy = [
    { icon: 'person', title: 'Personal Information', subtitle: 'Name, contact & identity details' },
    { icon: 'badge', title: 'Choose Your Role', subtitle: 'Client or Seller (others are invite-only)' },
    { icon: 'tune', title: 'Role-Specific Details', subtitle: 'Your professional info & credentials' },
  ];

  /** Header / CTA copy. */
  readonly createAccountLabel = 'Create Account';
  readonly joinTitle = 'Join the FINIX';
  readonly joinTitleBreak = 'ecosystem';
  readonly alreadyHaveAccount = 'Already have an account?';
  readonly signInLabel = 'Sign in';
  readonly step1Title = 'Step 1 — Personal Information';
  readonly step2Title = 'Step 2 — Choose Your Role';
  readonly step3TitlePrefix = 'Step 3 — ';

  /** Role options for step 2 — only CLIENT and SELLER can self-register. */
  readonly roleOptions: RegisterRoleOption[] = [
    { value: 'CLIENT', title: 'Client', description: 'Apply for credit, insurance & manage your wallet', icon: 'person' },
    { value: 'SELLER', title: 'Seller', description: 'Sell vehicles & manage listings', icon: 'storefront' },
  ];

  /** Form labels / placeholders (step 1). */
  readonly labelFirstName = 'First Name';
  readonly labelLastName = 'Last Name';
  readonly placeholderFirstName = 'Amadou';
  readonly placeholderLastName = 'Kone';
  readonly labelEmail = 'Email Address';
  readonly placeholderEmail = 'you@example.com';
  readonly labelPhone = 'Phone No.';
  readonly placeholderPhone = '+216 00 000 000';
  readonly labelDateOfBirth = 'Date of Birth';
  readonly labelCin = 'National ID (CIN)';
  readonly placeholderCin = '00000000';
  readonly labelAddress = 'Address';
  readonly placeholderAddress = '12 Rue de la Finance';
  readonly labelCity = 'City';
  readonly placeholderCity = 'Tunis';
  readonly labelPassword = 'Password';
  readonly placeholderPassword = 'Min. 8 characters';
  readonly continueLabel = 'Continue';
  readonly backLabel = 'Back';
  readonly createAccountButtonLabel = 'Create Account';

  /** Step 3 role-specific labels / notices. */
  readonly clientLocalisationLabel = 'Localisation / Quartier';
  readonly clientLocalisationPlaceholder = 'e.g. Bab Souika, Tunis';
  readonly clientKycNotice = "📋 You will complete KYC verification after account creation to unlock loan applications.";
  readonly agentAgencyLabel = 'Agency Code';
  readonly agentAgencyPlaceholder = 'e.g. 1024';
  readonly agentRegionLabel = 'Region Code';
  readonly agentRegionPlaceholder = 'e.g. 3';
  readonly agentNotice = '⚠️ Agent accounts require Admin activation before you can access the backoffice.';
  readonly sellerRegisterLabel = 'Commercial Register No.';
  readonly sellerRegisterPlaceholder = 'RC-2024-XXXXX';
  readonly sellerNotice = '🏪 Your account will be verified against the commercial registry before campaign activation.';
  readonly insurerNameLabel = 'Insurer / Company Name';
  readonly insurerNamePlaceholder = 'e.g. Assurances BIAT';
  readonly insurerEmailLabel = 'Contact Email (Public)';
  readonly insurerEmailPlaceholder = 'contact@assurances.tn';
  readonly insurerNotice = '🛡️ Partnership status will be confirmed by FINIX operations team within 48h.';

  /** Terms. */
  readonly termsLabel = "I agree to FINIX's";
  readonly termsLink = 'Terms of Service';
  readonly andLabel = 'and';
  readonly privacyLink = 'Privacy Policy';

  /** Testimonial (left panel). */
  readonly testimonialText = '"FINIX gave my family access to credit we never thought was possible. The process was transparent and fast."';
  readonly testimonialAuthor = 'Amadou K.';
  readonly testimonialSubtitle = 'Gold Tier Client — Dakar';

  /** Quick onboarding label. */
  readonly onboardingLabel = 'Quick 3-step onboarding';

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  nextStep(): void {
    if (this.currentStep < 3) this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  selectRole(role: string): void {
    this.selectedRole = role;
  }

  buildRegisterRequest(): RegisterRequest {
    const phoneNum = this.phone ? parseFloat(String(this.phone).replace(/\D/g, '')) || undefined : undefined;
    const cinNum = this.cin ? parseFloat(String(this.cin).replace(/\D/g, '')) || undefined : undefined;
    const dob = this.dateOfBirth ? new Date(this.dateOfBirth).toISOString().slice(0, 10) : undefined;
    const payload: RegisterRequest = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.selectedRole as 'CLIENT' | 'SELLER',
    };
    if (phoneNum != null) payload.phoneNumber = phoneNum;
    if (dob) payload.dateOfBirth = dob;
    if (cinNum != null) payload.cin = cinNum;
    if (this.address?.trim()) payload.address = this.address.trim();
    if (this.city?.trim()) payload.city = this.city.trim();
    if (this.selectedRole === 'CLIENT' && this.localisation?.trim()) payload.localisation = this.localisation.trim();
    if (this.selectedRole === 'SELLER' && this.commercialRegister?.trim()) payload.commercialRegister = this.commercialRegister.trim();
    return payload;
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (!this.firstName?.trim() || !this.lastName?.trim() || !this.email?.trim() || !this.password) {
      this.errorMessage = 'Please fill required fields: first name, last name, email, and password.';
      return;
    }
    if (this.selectedRole !== 'CLIENT' && this.selectedRole !== 'SELLER') {
      this.errorMessage = 'Please choose Client or Seller. Other roles are invite-only.';
      return;
    }
    this.loading = true;
    const request = this.buildRegisterRequest();
    this.auth.register(request).subscribe({
      next: (res) => {
        this.loading = false;
        this.auth.redirectByRole(res.role);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.error || 'Registration failed. Please try again.';
      },
    });
  }
}
