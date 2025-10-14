import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  constructor(private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword.update(show => !show);
  }

  async onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem('user', JSON.stringify({ email: this.email() || 'guest@example.com' }));
    this.router.navigate(['/dashboard']);
    this.isLoading.set(false);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  continueWithFacebook() {
    // Placeholder: integrate real Facebook OAuth via your backend or Firebase
    this.isLoading.set(true);
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({ provider: 'facebook', email: this.email() || 'fb_user@example.com' }));
      this.router.navigate(['/dashboard']);
      this.isLoading.set(false);
    }, 1200);
  }
}
