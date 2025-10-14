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
    this.isLoading.set(true);
    this.errorMessage.set('');
    await new Promise(resolve => setTimeout(resolve, 600));
    localStorage.setItem('user', JSON.stringify({ 
      firstName: this.firstName() || 'Guest',
      lastName: this.lastName() || '',
      email: this.email() || 'guest@example.com' 
    }));
    this.router.navigate(['/dashboard']);
    this.isLoading.set(false);
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

  continueWithFacebook() {
    // Placeholder: integrate real Facebook OAuth via your backend or Firebase
    this.isLoading.set(true);
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({ provider: 'facebook', email: this.email() || 'fb_user@example.com' }));
      this.router.navigate(['/dashboard']);
      this.isLoading.set(false);
    }, 1500);
  }
}
