import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FormField {
  name: string;
  label: string;
  required?: boolean;
  validators?: ValidatorFn[];
  value: any;
}

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  // Custom validators
  static requiredIf(condition: () => boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (condition() && !control.value) {
        return { requiredIf: { value: control.value } };
      }
      return null;
    };
  }

  static minAmount(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = Number(control.value);
      if (isNaN(value) || value < min) {
        return { minAmount: { min, actual: control.value } };
      }
      return null;
    };
  }

  static maxAmount(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = Number(control.value);
      if (isNaN(value) || value > max) {
        return { maxAmount: { max, actual: control.value } };
      }
      return null;
    };
  }

  static emailOrPhone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return null;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
      
      if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        return { emailOrPhone: { value } };
      }
      return null;
    };
  }

  static referenceNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return null; // Optional field

      const refRegex = /^[A-Z0-9\-]{3,20}$/;
      if (!refRegex.test(value.toUpperCase())) {
        return { referenceNumber: { value } };
      }
      return null;
    };
  }

  // Validate entire top-up form
  validateTopUpForm(formData: any): ValidationResult {
    const errors: string[] = [];

    // Client validation
    if (!formData.selectedClient) {
      errors.push('Please search and select a client');
    }

    // Amount validation
    const amount = Number(formData.topUpAmount);
    if (!amount || amount <= 0) {
      errors.push('Please enter a valid amount');
    } else if (amount < 10) {
      errors.push('Minimum top-up amount is 10 TND');
    } else if (amount > 10000) {
      errors.push('Maximum top-up amount is 10,000 TND');
    }

    // Payment method validation
    if (!formData.paymentMethod) {
      errors.push('Please select a payment method');
    }

    // Reference number validation (if provided)
    if (formData.referenceNumber?.trim()) {
      const refRegex = /^[A-Z0-9\-]{3,20}$/;
      if (!refRegex.test(formData.referenceNumber.trim().toUpperCase())) {
        errors.push('Reference number must be 3-20 characters (letters, numbers, hyphens only)');
      }
    }

    // Notes validation (if provided)
    if (formData.transactionNotes?.trim() && formData.transactionNotes.length > 500) {
      errors.push('Notes must be less than 500 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validate client search
  validateClientSearch(query: string): ValidationResult {
    const errors: string[] = [];

    if (!query?.trim()) {
      errors.push('Please enter search criteria (email, phone, or CIN)');
    } else if (query.trim().length < 3) {
      errors.push('Search query must be at least 3 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get error message for validation errors
  getErrorMessage(error: any, fieldName: string): string {
    switch (Object.keys(error)[0]) {
      case 'required':
        return `${fieldName} is required`;
      case 'requiredIf':
        return `${fieldName} is required`;
      case 'minAmount':
        return `Minimum amount is ${error.minAmount.min} TND`;
      case 'maxAmount':
        return `Maximum amount is ${error.maxAmount.max} TND`;
      case 'emailOrPhone':
        return 'Please enter a valid email or phone number';
      case 'referenceNumber':
        return 'Reference number must be 3-20 characters (letters, numbers, hyphens only)';
      case 'minlength':
        return `Minimum length is ${error.minlength.requiredLength} characters`;
      case 'maxlength':
        return `Maximum length is ${error.maxlength.requiredLength} characters`;
      default:
        return `${fieldName} is invalid`;
    }
  }

  // Real-time validation hints
  getValidationHints(fieldName: string, value: any): string[] {
    const hints: string[] = [];

    switch (fieldName) {
      case 'searchQuery':
        if (!value) {
          hints.push('Enter client email, phone, or CIN');
        } else if (value.length < 3) {
          hints.push('At least 3 characters required');
        }
        break;

      case 'topUpAmount':
        const amount = Number(value);
        if (!amount) {
          hints.push('Enter amount between 10 and 10,000 TND');
        } else if (amount < 10) {
          hints.push('Minimum: 10 TND');
        } else if (amount > 10000) {
          hints.push('Maximum: 10,000 TND');
        }
        break;

      case 'referenceNumber':
        if (value && !/^[A-Z0-9\-]{3,20}$/.test(value.toUpperCase())) {
          hints.push('3-20 characters: letters, numbers, hyphens only');
        }
        break;

      case 'transactionNotes':
        if (value && value.length > 400) {
          hints.push(`${500 - value.length} characters remaining`);
        }
        break;
    }

    return hints;
  }
}
