import { Component } from '@angular/core';
import { Router } from '@angular/router';

/** Role option for step 2 (MVVM: copy in VM). */
interface RegisterRoleOption {
  value: string;
  title: string;
  description: string;
  icon: string;
}

/**
 * ViewModel: register (MVVM).
 * Step/role copy and labels in VM; view only binds. Commands: nextStep, prevStep, selectRole.
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

  // Step 1: Personal info (static placeholders – form state can stay for future wiring)
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

  /** Static copy for left panel steps. */
  readonly stepsCopy = [
    { icon: 'person', title: 'Personal Information', subtitle: 'Name, contact & identity details' },
    { icon: 'badge', title: 'Choose Your Role', subtitle: 'Client, Agent, Seller, or Insurer' },
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

  /** Role options for step 2. */
  readonly roleOptions: RegisterRoleOption[] = [
    { value: 'CLIENT', title: 'Client', description: 'Apply for credit, insurance & manage your wallet', icon: 'person' },
    { value: 'AGENT', title: 'Agent', description: 'Review loan applications & manage your region', icon: 'support_agent' },
    { value: 'SELLER', title: 'Seller', description: 'Launch campaigns & track marketing performance', icon: 'storefront' },
    { value: 'INSURER', title: 'Insurer', description: 'Publish products & process insurance claims', icon: 'shield' },
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

  constructor(private router: Router) {}

  nextStep(): void {
    if (this.currentStep < 3) this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  selectRole(role: string): void {
    this.selectedRole = role;
  }

  onSubmit(): void {
    console.log('Register submitted', { firstName: this.firstName, role: this.selectedRole });
  }
}
