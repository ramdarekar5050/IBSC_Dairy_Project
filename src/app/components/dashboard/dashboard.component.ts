import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Module {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface MilkForm {
  date: string;
  farmerId: string;
  liters: number | '';
  fat: number | '';
  snf: number | '';
  farmerName: string;
  rate: number | '';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  user = signal<any>(null);
  selectedModule = signal<string | null>(null);
  milkSession = signal<'morning' | 'evening'>('morning');
  selectedMilkSubModule = signal<'morning' | 'evening' | null>(null);

  // Customers state
  customers = signal<Array<{ farmerId: string; farmerName: string }>>([]);
  newCustomer = signal<{ farmerId: string; farmerName: string }>({ farmerId: '', farmerName: '' });

  milkEntryForm = signal<MilkForm>({
    date: new Date().toISOString().slice(0, 10),
    farmerId: '',
    liters: '',
    fat: '',
    snf: '',
    farmerName: '',
    rate: ''
  });

  milkEntries = signal<Array<{
    session: 'morning' | 'evening';
    date: string;
    farmerId: string;
    farmerName: string;
    liters: number;
    fat: number;
    snf: number;
    rate: number;
    totalAmount: number;
  }>>([]);

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
    if (moduleId === 'milk-entry') {
      this.resetMilkForm();
      this.selectedMilkSubModule.set(null);
    }
  }

  getModuleName(moduleId: string): string {
    const module = this.modules.find(m => m.id === moduleId);
    return module ? module.name : '';
  }

  setMilkSession(session: 'morning' | 'evening') {
    if (session !== this.milkSession()) {
      this.milkSession.set(session);
      this.resetMilkForm();
    }
  }

  openMilkSubModule(session: 'morning' | 'evening') {
    this.milkSession.set(session);
    this.selectedMilkSubModule.set(session);
    this.resetMilkForm();
  }

  resetMilkForm() {
    const today = new Date().toISOString().slice(0, 10);
    this.milkEntryForm.set({
      date: today,
      farmerId: '',
      liters: '',
      fat: '',
      snf: '',
      farmerName: '',
      rate: ''
    });
  }

  updateMilkForm<K extends keyof MilkForm>(key: K, value: MilkForm[K]) {
    const current = this.milkEntryForm();
    this.milkEntryForm.set({ ...current, [key]: value });
  }

  onFarmerIdChange(id: string) {
    // Placeholder for future DB fetch; for now, keep name blank
    const current = this.milkEntryForm();
    this.milkEntryForm.set({ ...current, farmerId: id, farmerName: '' });
  }

  saveMilkEntry() {
    const form = this.milkEntryForm();
    if (!form.farmerId || !form.liters || !form.fat || !form.snf) {
      alert('Please fill all fields');
      return;
    }
    const litersNum = Number(form.liters);
    const fatNum = Number(form.fat);
    const snfNum = Number(form.snf);
    const rateNum = form.rate === '' ? 0 : Number(form.rate);
    const total = +(litersNum * rateNum).toFixed(2);
    this.milkEntries.update(list => [
      ...list,
      {
        session: this.milkSession(),
        date: form.date,
        farmerId: form.farmerId.trim(),
        farmerName: form.farmerName.trim(),
        liters: litersNum,
        fat: fatNum,
        snf: snfNum,
        rate: rateNum,
        totalAmount: total
      }
    ]);
    this.resetMilkForm();
  }

  removeMilkEntry(index: number) {
    const current = this.milkEntries();
    const entry = current[index];
    if (!entry) {
      return;
    }
    const message = `Are you sure you want to delete this ${entry.session} entry?\n\nDate: ${entry.date}\nFarmer ID: ${entry.farmerId}\nLiters: ${entry.liters}`;
    const confirmed = window.confirm(message);
    if (!confirmed) {
      return;
    }
    const updated = current.filter((_, i) => i !== index);
    this.milkEntries.set(updated);
  }

  // Customers helpers
  updateNewCustomer<K extends keyof { farmerId: string; farmerName: string }>(key: K, value: { farmerId: string; farmerName: string }[K]) {
    const current = this.newCustomer();
    this.newCustomer.set({ ...current, [key]: (value as string).trimStart() });
  }

  addCustomer() {
    const { farmerId, farmerName } = this.newCustomer();
    const id = farmerId.trim();
    const name = farmerName.trim();
    if (!id || !name) {
      alert('Enter both Farmer ID and Farmer Name');
      return;
    }
    const exists = this.customers().some(c => c.farmerId.toLowerCase() === id.toLowerCase());
    if (exists) {
      alert('Farmer ID already exists');
      return;
    }
    this.customers.update(list => [...list, { farmerId: id, farmerName: name }]);
    this.newCustomer.set({ farmerId: '', farmerName: '' });
  }

  removeCustomer(index: number) {
    const current = this.customers();
    if (!current[index]) return;
    const confirmed = window.confirm(`Delete customer ${current[index].farmerId} - ${current[index].farmerName}?`);
    if (!confirmed) return;
    this.customers.set(current.filter((_, i) => i !== index));
  }
}
