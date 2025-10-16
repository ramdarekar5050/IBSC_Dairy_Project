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
  loginId = signal('');
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
    await new Promise(resolve => setTimeout(resolve, 300));

    const validLoginId = 'demo';
    const validPassword = 'demo123';

    if (this.loginId().trim() === validLoginId && this.password() === validPassword) {
      localStorage.setItem('user', JSON.stringify({ loginId: this.loginId() }));
      this.router.navigate(['/dashboard']);
      this.isLoading.set(false);
      return;
    }

    this.errorMessage.set('Invalid Login ID or Password');
    this.isLoading.set(false);
  }
}
