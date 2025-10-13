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
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, accept any email/password
      if (this.email().includes('@') && this.password().length >= 6) {
        // Store user session (in real app, this would be handled by auth service)
        localStorage.setItem('user', JSON.stringify({ email: this.email() }));
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set('Invalid email or password');
      }
    } catch (error) {
      this.errorMessage.set('Login failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}
