import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdvancedPaymentCashComponent, AdvanceEntry } from './advanced-payment/cash/cash.component';
import { AdvancedPaymentSupplementsComponent, SupplementEntry } from './advanced-payment/supplements/supplements.component';
import { DailyReportsComponent } from './daily-reports/daily-reports.component';
import { MonthlyReportsComponent } from './monthly-reports/monthly-reports.component';
import { FeedDistributionComponent } from './feed-distribution/feed-distribution.component';
import { Router } from '@angular/router';
import { RateChartManagementModule } from './rate-chart-management/rate-chart-management.module';
import { BillingComponent } from './billing/billing.component';
import {
  BillingInvoice,
  CustomerProfile,
  InvoiceStatus,
  MilkEntry,
  MilkSession
} from '../../models/dairy.models';

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
  imports: [
    CommonModule,
    FormsModule,
    AdvancedPaymentCashComponent,
    AdvancedPaymentSupplementsComponent,
    DailyReportsComponent,
    MonthlyReportsComponent,
    FeedDistributionComponent,
    RateChartManagementModule,
    BillingComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent {
  user = signal<any>(null);
  selectedModule = signal<string | null>(null);
  milkSession = signal<MilkSession>('morning');
  selectedMilkSubModule = signal<MilkSession | null>(null);
  selectedAdvancedSubModule = signal<'entry' | 'received' | null>(null);
  selectedReportsSubModule = signal<'daily' | 'monthly' | null>(null);

  // Customers state
  customers = signal<CustomerProfile[]>([]);
  newCustomer = signal<CustomerProfile>({ 
    farmerId: '', 
    farmerName: '', 
    address: '', 
    mobileNumber: '' 
  });
  editingCustomerIndex = signal<number | null>(null);
  editingCustomer = signal<CustomerProfile>({ 
    farmerId: '', 
    farmerName: '', 
    address: '', 
    mobileNumber: '' 
  });

  milkEntryForm = signal<MilkForm>(this.createDefaultMilkForm());

  milkEntries = signal<MilkEntry[]>([]);
  editingMilkIndex = signal<number | null>(null);

  billingInvoices = signal<BillingInvoice[]>(this.loadInvoicesFromStorage());

  // Advance Payment state
  cashAdvanceEntries = signal<AdvanceEntry[]>(this.loadCashEntriesFromStorage());
  supplementEntries = signal<SupplementEntry[]>(this.loadSupplementEntriesFromStorage());
  selectedAdvanceFarmerId = signal<string>('');

  // Computed filtered entries for advance payment
  filteredCashAdvanceEntries = computed(() => {
    const farmerId = this.selectedAdvanceFarmerId();
    const entries = this.cashAdvanceEntries();
    if (!farmerId) return entries;
    return entries.filter(e => e.farmerId === farmerId);
  });

  filteredSupplementEntries = computed(() => {
    const farmerId = this.selectedAdvanceFarmerId();
    const entries = this.supplementEntries();
    if (!farmerId) return entries;
    return entries.filter(e => e.farmerId === farmerId);
  });

  // UI/validation state
  submitAttempted = signal<boolean>(false);
  toast = signal<{ type: 'success' | 'error' | null; message: string } | null>(null);

  modules: Module[] = [
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
      id: 'reports',
      name: 'Reports',
      icon: '📊',
      description: 'Daily and monthly reports'
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
    },
    {
      id: 'rate-chart',
      name: 'Rate Chart Management',
      icon: '📈',
      description: 'Manage milk rate charts'
    },
    {
      id: 'feed-distribution',
      name: 'Feed Distribution',
      icon: '🛒',
      description: 'Plan and track feed'
    },
    {
      id: 'transaction-history',
      name: 'Transaction History',
      icon: '🧾',
      description: 'Review past transactions'
    }
  ];

  private readonly billingStorageKey = 'dairyBillingInvoices';
  private readonly cashAdvanceStorageKey = 'dairyCashAdvanceEntries';
  private readonly supplementStorageKey = 'dairySupplementEntries';

  constructor(private router: Router) {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user.set(JSON.parse(userData));
    }

    effect(() => {
      if (typeof window === 'undefined') return;
      const data = this.billingInvoices();
      localStorage.setItem(this.billingStorageKey, JSON.stringify(data));
    });

    effect(() => {
      if (typeof window === 'undefined') return;
      const data = this.cashAdvanceEntries();
      localStorage.setItem(this.cashAdvanceStorageKey, JSON.stringify(data));
    });

    effect(() => {
      if (typeof window === 'undefined') return;
      const data = this.supplementEntries();
      localStorage.setItem(this.supplementStorageKey, JSON.stringify(data));
    });
  }

  logout() {
    localStorage.removeItem('user');
    this.user.set(null);
    this.router.navigate(['/']);
  }

  onModuleClick(moduleId: string) {
    this.selectedModule.set(moduleId);
    if (moduleId === 'milk-entry') {
      this.resetMilkForm();
      this.selectedMilkSubModule.set(null);
    }
    if (moduleId === 'reports') {
      this.selectedReportsSubModule.set(null);
    }
  }

  getModuleName(moduleId: string): string {
    const module = this.modules.find(m => m.id === moduleId);
    return module ? module.name : '';
  }

  setMilkSession(session: MilkSession) {
    if (session !== this.milkSession()) {
      this.milkSession.set(session);
      this.resetMilkForm();
    }
  }

  openMilkSubModule(session: MilkSession) {
    this.milkSession.set(session);
    this.selectedMilkSubModule.set(session);
    this.resetMilkForm();
  }

  // Helpers for interactive UI in dashboard milk-entry view
  getSessionEntries() {
    const session = this.milkSession();
    return this.milkEntries().filter(e => e.session === session);
  }

  getSessionTotals() {
    const list = this.getSessionEntries();
    const totalLiters = list.reduce((sum, e) => sum + (Number(e.liters) || 0), 0);
    const totalAmount = list.reduce((sum, e) => sum + (Number(e.totalAmount) || 0), 0);
    return { totalLiters, totalAmount };
  }

  amountPreview(): string {
    const form = this.milkEntryForm();
    const liters = Number(form.liters) || 0;
    const rate = Number(form.rate) || 0;
    return (liters * rate).toFixed(2);
  }

  isInvalid(field: keyof MilkForm): boolean {
    if (!this.submitAttempted()) return false;
    const v = this.milkEntryForm()[field];
    return v === '' || v === undefined || v === null || (typeof v === 'number' && isNaN(v));
  }

  private showToast(type: 'success' | 'error', message: string) {
    this.toast.set({ type, message });
    setTimeout(() => {
      if (this.toast()) this.toast.set(null);
    }, 2200);
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
    this.submitAttempted.set(true);
    if (!form.farmerId || !form.liters || !form.fat || !form.snf || form.rate === '') {
      this.showToast('error', 'Please fill all required fields');
      return;
    }
    
    const litersNum = Number(form.liters);
    const fatNum = Number(form.fat);
    const snfNum = Number(form.snf);
    const rateNum = Number((form.rate as number | '') || 0);
    const total = +(litersNum * rateNum).toFixed(2);
    const entry: MilkEntry = {
      session: this.milkSession(),
      date: form.date,
      farmerId: form.farmerId.trim(),
      farmerName: form.farmerName.trim(),
      liters: litersNum,
      fat: fatNum,
      snf: snfNum,
      rate: rateNum,
      totalAmount: total
    };

    const editIndex = this.editingMilkIndex();
    if (editIndex !== null) {
      const list = [...this.milkEntries()];
      list[editIndex] = { ...entry };
      this.milkEntries.set(list);
      this.editingMilkIndex.set(null);
    } else {
      this.milkEntries.update(list => [...list, { ...entry }]);
    }
    this.resetMilkForm();
    this.submitAttempted.set(false);
    this.showToast('success', 'Entry saved successfully');
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

  editMilkEntry(index: number) {
    const current = this.milkEntries();
    const entry = current[index];
    if (!entry) return;
    this.milkSession.set(entry.session);
    this.selectedMilkSubModule.set(entry.session);
    this.milkEntryForm.set({
      date: entry.date,
      farmerId: entry.farmerId,
      liters: entry.liters,
      fat: entry.fat,
      snf: entry.snf,
      farmerName: entry.farmerName,
      rate: entry.rate
    });
    this.editingMilkIndex.set(index);
  }

  // Customers helpers
  updateNewCustomer<K extends keyof CustomerProfile>(key: K, value: CustomerProfile[K]) {
    const current = this.newCustomer();
    this.newCustomer.set({ ...current, [key]: (value as string).trimStart() });
  }

  addCustomer() {
    const { farmerId, farmerName, address, mobileNumber } = this.newCustomer();
    const id = farmerId.trim();
    const name = farmerName.trim();
    const addr = address.trim();
    const mobile = mobileNumber.trim();
    if (!id || !name) {
      alert('Enter both Farmer ID and Farmer Name');
      return;
    }
    const exists = this.customers().some(c => c.farmerId.toLowerCase() === id.toLowerCase());
    if (exists) {
      alert('Farmer ID already exists');
      return;
    }
    this.customers.update(list => [...list, { farmerId: id, farmerName: name, address: addr, mobileNumber: mobile }]);
    this.newCustomer.set({ farmerId: '', farmerName: '', address: '', mobileNumber: '' });
  }

  removeCustomer(index: number) {
    const current = this.customers();
    if (!current[index]) return;
    const confirmed = window.confirm(`Delete customer ${current[index].farmerId} - ${current[index].farmerName}?`);
    if (!confirmed) return;
    this.customers.set(current.filter((_, i) => i !== index));
  }

  startEditCustomer(index: number) {
    const current = this.customers();
    const target = current[index];
    if (!target) return;
    this.editingCustomerIndex.set(index);
    this.editingCustomer.set({ 
      farmerId: target.farmerId, 
      farmerName: target.farmerName,
      address: target.address,
      mobileNumber: target.mobileNumber
    });
  }

  updateEditingCustomer(key: 'farmerId' | 'farmerName' | 'address' | 'mobileNumber', value: string) {
    const current = this.editingCustomer();
    this.editingCustomer.set({ ...current, [key]: value });
  }

  saveEditCustomer(index: number) {
    const { farmerId, farmerName, address, mobileNumber } = this.editingCustomer();
    const id = farmerId.trim();
    const name = farmerName.trim();
    const addr = address.trim();
    const mobile = mobileNumber.trim();
    if (!id || !name) return;
    const list = [...this.customers()];
    list[index] = { farmerId: id, farmerName: name, address: addr, mobileNumber: mobile };
    this.customers.set(list);
    this.cancelEditCustomer();
  }

  cancelEditCustomer() {
    this.editingCustomerIndex.set(null);
    this.editingCustomer.set({ farmerId: '', farmerName: '', address: '', mobileNumber: '' });
  }

  handleInvoiceCreated(invoice: BillingInvoice) {
    this.billingInvoices.update(list => [...list, invoice]);
    this.showToast('success', 'Invoice created successfully');
  }

  handleInvoiceStatusChange(payload: { id: string; status: InvoiceStatus }) {
    const updated = this.billingInvoices().map(invoice =>
      invoice.id === payload.id ? { ...invoice, status: payload.status } : invoice
    );
    this.billingInvoices.set(updated);
    this.showToast('success', 'Invoice status updated');
  }

  handleInvoiceDeleted(id: string) {
    const confirmed = window.confirm('Are you sure you want to delete this invoice?');
    if (!confirmed) return;
    this.billingInvoices.set(this.billingInvoices().filter(invoice => invoice.id !== id));
    this.showToast('success', 'Invoice deleted');
  }

  private createDefaultMilkForm(): MilkForm {
    return {
      date: new Date().toISOString().slice(0, 10),
      farmerId: '',
      liters: '',
      fat: '',
      snf: '',
      farmerName: '',
      rate: ''
    };
  }

  private loadInvoicesFromStorage(): BillingInvoice[] {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const stored = localStorage.getItem(this.billingStorageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored) as BillingInvoice[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private loadCashEntriesFromStorage(): AdvanceEntry[] {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const stored = localStorage.getItem(this.cashAdvanceStorageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored) as AdvanceEntry[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private loadSupplementEntriesFromStorage(): SupplementEntry[] {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const stored = localStorage.getItem(this.supplementStorageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored) as SupplementEntry[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Advance Payment handlers
  handleCashAdvanceAdded(entry: AdvanceEntry) {
    this.cashAdvanceEntries.update(list => [...list, entry]);
    this.showToast('success', 'Cash advance entry added successfully');
  }

  handleCashAdvanceDeleted(entryId: string) {
    this.cashAdvanceEntries.set(this.cashAdvanceEntries().filter(e => e.id !== entryId));
    this.showToast('success', 'Cash advance entry deleted');
  }

  handleSupplementAdded(entry: SupplementEntry) {
    this.supplementEntries.update(list => [...list, entry]);
    this.showToast('success', 'Supplement entry added successfully');
  }

  handleSupplementDeleted(entryId: string) {
    this.supplementEntries.set(this.supplementEntries().filter(e => e.id !== entryId));
    this.showToast('success', 'Supplement entry deleted');
  }
}
