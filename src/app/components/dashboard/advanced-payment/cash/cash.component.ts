import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerProfile } from '../../../../models/dairy.models';

export interface AdvanceEntry {
  id: string;
  date: string;
  farmerId: string;
  farmerName: string;
  description: string;
  amount: number;
  createdAt: string;
}

@Component({
  selector: 'app-advanced-payment-cash',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cash.component.html',
  styleUrl: './cash.component.css'
})
export class AdvancedPaymentCashComponent {
  @Input() customers: CustomerProfile[] = [];
  @Input() entries: AdvanceEntry[] = [];
  @Input() selectedFarmerId: string = '';

  @Output() entryAdded = new EventEmitter<AdvanceEntry>();
  @Output() entryDeleted = new EventEmitter<string>();

  activeTab = signal<'add' | 'show'>('add');

  // Form state
  form = signal<Omit<AdvanceEntry, 'id' | 'createdAt'>>({
    date: new Date().toISOString().slice(0, 10),
    farmerId: '',
    farmerName: '',
    description: '',
    amount: 0
  });

  // Computed totals
  totalAmount = computed(() => {
    return this.entries.reduce((sum, entry) => sum + entry.amount, 0);
  });

  switchTab(tab: 'add' | 'show') {
    this.activeTab.set(tab);
  }

  update<K extends keyof Omit<AdvanceEntry, 'id' | 'createdAt'>>(key: K, value: Omit<AdvanceEntry, 'id' | 'createdAt'>[K]) {
    const current = this.form();
    this.form.set({ ...current, [key]: value });
  }

  onFarmerIdChange(farmerId: string) {
    const customer = this.customers.find(c => c.farmerId === farmerId);
    const current = this.form();
    this.form.set({
      ...current,
      farmerId: farmerId,
      farmerName: customer ? customer.farmerName : ''
    });
  }

  onSave() {
    const f = this.form();
    if (!f.farmerId || !f.date || !f.amount || f.amount <= 0) {
      alert('Please fill all required fields (Farmer ID, Date, and Amount)');
      return;
    }

    const newEntry: AdvanceEntry = {
      ...f,
      id: `CASH_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString()
    };

    this.entryAdded.emit(newEntry);
    this.reset();
    this.activeTab.set('show');
  }

  reset() {
    this.form.set({
      date: new Date().toISOString().slice(0, 10),
      farmerId: this.selectedFarmerId || '',
      farmerName: '',
      description: '',
      amount: 0
    });
  }

  onDelete(entryId: string) {
    const confirmed = window.confirm('Are you sure you want to delete this advance entry?');
    if (confirmed) {
      this.entryDeleted.emit(entryId);
    }
  }

  getCustomerName(farmerId: string): string {
    const customer = this.customers.find(c => c.farmerId === farmerId);
    return customer ? customer.farmerName : farmerId;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return `₹ ${amount.toFixed(2)}`;
  }
}
