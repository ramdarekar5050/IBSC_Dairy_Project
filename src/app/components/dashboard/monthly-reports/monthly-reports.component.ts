import { Component, Input, OnChanges, SimpleChanges, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerProfile, MilkEntry } from '../../../models/dairy.models';

@Component({
  selector: 'app-monthly-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './monthly-reports.component.html',
  styleUrl: './monthly-reports.component.css'
})
export class MonthlyReportsComponent implements OnChanges {
  @Input() milkEntries: MilkEntry[] = [];
  @Input() customers: CustomerProfile[] = [];

  private milkEntriesSignal = signal<MilkEntry[]>([]);
  protected readonly customersSignal = signal<CustomerProfile[]>([]);

  selectedPeriod = signal<string>('');
  farmerId = signal<string>('');

  periods = computed(() => {
    const entries = this.milkEntriesSignal();
    const map = new Map<string, { key: string; year: number; month: number; label: string; startDate: string; endDate: string }>();

    entries.forEach(entry => {
      const [yearStr, monthStr] = entry.date.split('-');
      const year = Number(yearStr);
      const month = Number(monthStr);
      const key = `${yearStr}-${monthStr}`;
      if (!map.has(key)) {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        map.set(key, {
          key,
          year,
          month,
          label: firstDay.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
          startDate: firstDay.toISOString().slice(0, 10),
          endDate: lastDay.toISOString().slice(0, 10)
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const yearCompare = b.year - a.year;
      if (yearCompare !== 0) return yearCompare;
      return b.month - a.month;
    });
  });

  filteredEntries = computed(() => {
    const period = this.selectedPeriod();
    if (!period) return [];
    const [yearStr, monthStr] = period.split('-');
    const farmer = this.farmerId().toLowerCase();

    return this.milkEntriesSignal()
      .filter(entry => {
        if (!entry.date.startsWith(`${yearStr}-${monthStr}`)) return false;
        if (farmer && entry.farmerId.toLowerCase() !== farmer) return false;
        return true;
      })
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        if (a.session === b.session) return a.farmerId.localeCompare(b.farmerId);
        return a.session === 'morning' ? -1 : 1;
      });
  });

  monthlySummary = computed(() => {
    const entries = this.filteredEntries();
    const totalLiters = entries.reduce((sum, e) => sum + e.liters, 0);
    const totalAmount = entries.reduce((sum, e) => sum + e.totalAmount, 0);
    const uniqueDays = new Set(entries.map(e => e.date)).size;
    const uniqueFarmers = new Set(entries.map(e => e.farmerId)).size;
    const averagePerDay = uniqueDays ? totalLiters / uniqueDays : 0;
    return { totalLiters, totalAmount, uniqueDays, uniqueFarmers, entryCount: entries.length, averagePerDay };
  });

  breakdownByDay = computed(() => {
    const entries = this.filteredEntries();
    const map = new Map<string, { date: string; liters: number; amount: number; entries: MilkEntry[] }>();
    entries.forEach(entry => {
      if (!map.has(entry.date)) {
        map.set(entry.date, { date: entry.date, liters: 0, amount: 0, entries: [] });
      }
      const bucket = map.get(entry.date)!;
      bucket.liters += entry.liters;
      bucket.amount += entry.totalAmount;
      bucket.entries.push(entry);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  });

  breakdownByFarmer = computed(() => {
    const entries = this.filteredEntries();
    const map = new Map<string, { farmerId: string; farmerName: string; liters: number; amount: number; entryCount: number }>();
    entries.forEach(entry => {
      const key = entry.farmerId.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          farmerId: entry.farmerId,
          farmerName: this.resolveFarmerName(entry.farmerId),
          liters: 0,
          amount: 0,
          entryCount: 0
        });
      }
      const bucket = map.get(key)!;
      bucket.liters += entry.liters;
      bucket.amount += entry.totalAmount;
      bucket.entryCount += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.farmerName.localeCompare(b.farmerName));
  });

  selectedPeriodInfo = computed(() => {
    const key = this.selectedPeriod();
    if (!key) return null;
    return this.periods().find(period => period.key === key) ?? null;
  });

  constructor() {
    effect(() => {
      const periods = this.periods();
      const selected = this.selectedPeriod();
      if (!periods.length) {
        if (selected) {
          this.selectedPeriod.set('');
        }
        return;
      }
      if (!selected || !periods.some(period => period.key === selected)) {
        this.selectedPeriod.set(periods[0].key);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['milkEntries']) {
      this.milkEntriesSignal.set(this.milkEntries ?? []);
    }
    if (changes['customers']) {
      this.customersSignal.set(this.customers ?? []);
    }
  }

  updatePeriod(periodKey: string) {
    this.selectedPeriod.set(periodKey);
  }

  updateFarmer(value: string) {
    this.farmerId.set(value.trim());
  }

  clearFarmerFilter() {
    this.farmerId.set('');
  }

  resolveFarmerName(farmerId: string): string {
    const customer = this.customersSignal().find(c => c.farmerId.toLowerCase() === farmerId.toLowerCase());
    return customer?.farmerName ?? farmerId;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return `₹ ${amount.toFixed(2)}`;
  }
}


