import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  firstName = signal('');
  lastName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  agreeToTerms = signal(false);
  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errorMessage = signal('');

  constructor(private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword.update(show => !show);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update(show => !show);
  }

  async onSubmit() {
    if (!this.firstName() || !this.lastName() || !this.email() || !this.password() || !this.confirmPassword()) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    if (!this.agreeToTerms()) {
      this.errorMessage.set('Please agree to the terms and conditions');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    if (this.password().length < 8) {
      this.errorMessage.set('Password must be at least 8 characters long');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, accept any valid email/password
      if (this.email().includes('@') && this.password().length >= 8) {
        // Store user session (in real app, this would be handled by auth service)
        localStorage.setItem('user', JSON.stringify({ 
          firstName: this.firstName(),
          lastName: this.lastName(),
          email: this.email() 
        }));
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set('Invalid email format or password too weak');
      }
    } catch (error) {
      this.errorMessage.set('Sign up failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  getPasswordStrength(): string {
    const password = this.password();
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'fair';
    if (password.length < 12) return 'good';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
      default: return '';
    }
  }
}
