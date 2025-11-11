import { Component, Input, OnChanges, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerProfile, MilkEntry } from '../../../models/dairy.models';

@Component({
  selector: 'app-daily-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-reports.component.html',
  styleUrl: './daily-reports.component.css'
})
export class DailyReportsComponent implements OnChanges {
  @Input() milkEntries: MilkEntry[] = [];
  @Input() customers: CustomerProfile[] = [];

  private readonly today = new Date();
  private readonly defaultStart: string;

  constructor() {
    const start = new Date(this.today);
    start.setDate(start.getDate() - 6);
    this.defaultStart = start.toISOString().slice(0, 10);
    this.filters.set({
      startDate: this.defaultStart,
      endDate: this.today.toISOString().slice(0, 10),
      farmerId: ''
    });
  }

  private milkEntriesSignal = signal<MilkEntry[]>([]);
  protected readonly customersSignal = signal<CustomerProfile[]>([]);

  filters = signal<{ startDate: string; endDate: string; farmerId: string }>({
    startDate: '',
    endDate: '',
    farmerId: ''
  });

  filteredEntries = computed(() => {
    const entries = this.milkEntriesSignal();
    if (!entries.length) return [];

    const { startDate, endDate, farmerId } = this.filters();
    return entries
      .filter(entry => {
        if (startDate && entry.date < startDate) return false;
        if (endDate && entry.date > endDate) return false;
        if (farmerId && entry.farmerId.toLowerCase() !== farmerId.toLowerCase()) return false;
        return true;
      })
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        if (a.session === b.session) return a.farmerId.localeCompare(b.farmerId);
        return a.session === 'morning' ? -1 : 1;
      });
  });

  summaryStats = computed(() => {
    const entries = this.filteredEntries();
    const totalLiters = entries.reduce((sum, e) => sum + e.liters, 0);
    const totalAmount = entries.reduce((sum, e) => sum + e.totalAmount, 0);
    const uniqueFarmers = new Set(entries.map(e => e.farmerId)).size;
    return { totalLiters, totalAmount, uniqueFarmers, entryCount: entries.length };
  });

  groupedByDate = computed(() => {
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

  groupedByFarmer = computed(() => {
    const entries = this.filteredEntries();
    const map = new Map<string, { farmerId: string; farmerName: string; liters: number; amount: number; entryCount: number }>();
    entries.forEach(entry => {
      const key = entry.farmerId;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['milkEntries']) {
      this.milkEntriesSignal.set(this.milkEntries ?? []);
    }
    if (changes['customers']) {
      this.customersSignal.set(this.customers ?? []);
    }
  }

  updateFilter(key: 'startDate' | 'endDate' | 'farmerId', value: string) {
    const next = { ...this.filters(), [key]: value };
    this.filters.set(next);
  }

  clearFarmerFilter() {
    const current = this.filters();
    this.filters.set({ ...current, farmerId: '' });
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

  formatCurrency(value: number): string {
    return `₹ ${value.toFixed(2)}`;
  }
}


