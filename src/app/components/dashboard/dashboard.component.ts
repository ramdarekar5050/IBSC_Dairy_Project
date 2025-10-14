import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Module {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  user = signal<any>(null);
  selectedModule = signal<string | null>(null);

  modules: Module[] = [
    {
      id: 'add-centre',
      name: 'Add Centre',
      icon: '🏢',
      description: 'Manage dairy centres'
    },
    {
      id: 'milk-entry',
      name: 'Milk Entry',
      icon: '🥛',
      description: 'Record milk collection'
    },
    {
      id: 'billing',
      name: 'Billing',
      icon: '💰',
      description: 'Generate bills and invoices'
    },
    {
      id: 'daily-reports',
      name: 'Daily Reports',
      icon: '📊',
      description: 'View daily analytics'
    },
    {
      id: 'advanced-payment',
      name: 'Advanced Payment',
      icon: '💳',
      description: 'Process advance payments'
    },
    {
      id: 'add-customer',
      name: 'Add Customer',
      icon: '👥',
      description: 'Manage customer database'
    }
  ];

  constructor(private router: Router) {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user.set(JSON.parse(userData));
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  onModuleClick(moduleId: string) {
    this.selectedModule.set(moduleId);
  }

  getModuleName(moduleId: string): string {
    const module = this.modules.find(m => m.id === moduleId);
    return module ? module.name : '';
  }
}
