import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerProfile } from '../../../../models/dairy.models';

export interface SupplementEntry {
  id: string;
  date: string;
  farmerId: string;
  farmerName: string;
  supplementType: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  description: string;
  createdAt: string;
}

@Component({
  selector: 'app-advanced-payment-supplements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplements.component.html',
  styleUrl: './supplements.component.css'
})
export class AdvancedPaymentSupplementsComponent {
  @Input() customers: CustomerProfile[] = [];
  @Input() entries: SupplementEntry[] = [];
  @Input() selectedFarmerId: string = '';

  @Output() entryAdded = new EventEmitter<SupplementEntry>();
  @Output() entryDeleted = new EventEmitter<string>();

  activeTab = signal<'add' | 'show'>('add');

  // Form state
  form = signal<Omit<SupplementEntry, 'id' | 'createdAt'>>({
    date: new Date().toISOString().slice(0, 10),
    farmerId: '',
    farmerName: '',
    supplementType: '',
    quantity: 0,
    unit: 'kg',
    rate: 0,
    amount: 0,
    description: ''
  });

  supplementTypes = ['Feed', 'Medicine', 'Vaccine', 'Mineral Mix', 'Other'];

  // Computed totals
  totalAmount = computed(() => {
    return this.entries.reduce((sum, entry) => sum + entry.amount, 0);
  });

  switchTab(tab: 'add' | 'show') {
    this.activeTab.set(tab);
  }

  update<K extends keyof Omit<SupplementEntry, 'id' | 'createdAt'>>(key: K, value: Omit<SupplementEntry, 'id' | 'createdAt'>[K]) {
    const current = this.form();
    const updated = { ...current, [key]: value };
    
    // Auto-calculate amount when quantity or rate changes
    if (key === 'quantity' || key === 'rate') {
      updated.amount = Number(updated.quantity) * Number(updated.rate);
    }
    
    this.form.set(updated);
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
    if (!f.farmerId || !f.date || !f.supplementType || !f.quantity || !f.rate) {
      alert('Please fill all required fields (Farmer ID, Date, Supplement Type, Quantity, and Rate)');
      return;
    }
    
    const newEntry: SupplementEntry = {
      ...f,
      id: `SUPP_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      amount: Number(f.quantity) * Number(f.rate)
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
      supplementType: '',
      quantity: 0,
      unit: 'kg',
      rate: 0,
      amount: 0,
      description: ''
    });
  }

  onDelete(entryId: string) {
    const confirmed = window.confirm('Are you sure you want to delete this supplement entry?');
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
