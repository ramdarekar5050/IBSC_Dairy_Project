import { Component, computed, effect, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdvancedPaymentCashComponent, AdvanceEntry } from './cash/cash.component';
import { AdvancedPaymentSupplementsComponent } from './supplements/supplements.component';
import { CustomerProfile } from '../../../models/dairy.models';

@Component({
  selector: 'app-advanced-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, AdvancedPaymentCashComponent, AdvancedPaymentSupplementsComponent],
  templateUrl: './advanced-payment.component.html',
  styleUrl: './advanced-payment.component.css'
})
export class AdvancedPaymentComponent {
  @Input() customers: CustomerProfile[] = [];
  @Input() cashEntries: AdvanceEntry[] = [];
  @Input() supplementEntries: any[] = [];

  @Output() cashEntryAdded = new EventEmitter<AdvanceEntry>();
  @Output() cashEntryDeleted = new EventEmitter<string>();
  @Output() supplementEntryAdded = new EventEmitter<any>();
  @Output() supplementEntryDeleted = new EventEmitter<string>();

  activeSubModule = signal<'cash' | 'supplements'>('cash');
  selectedFarmerId = signal<string>('');

  // Computed filtered entries
  filteredCashEntries = computed(() => {
    const farmerId = this.selectedFarmerId();
    if (!farmerId) return this.cashEntries;
    return this.cashEntries.filter(entry => entry.farmerId === farmerId);
  });

  filteredSupplementEntries = computed(() => {
    const farmerId = this.selectedFarmerId();
    if (!farmerId) return this.supplementEntries;
    return this.supplementEntries.filter(entry => entry.farmerId === farmerId);
  });

  // Totals
  cashTotal = computed(() => {
    return this.filteredCashEntries().reduce((sum, entry) => sum + entry.amount, 0);
  });

  supplementTotal = computed(() => {
    return this.filteredSupplementEntries().reduce((sum, entry) => sum + (entry.amount || 0), 0);
  });

  // Get customer name
  getCustomerName(farmerId: string): string {
    const customer = this.customers.find(c => c.farmerId === farmerId);
    return customer ? customer.farmerName : farmerId;
  }

  // Get unique farmer IDs from entries
  getUniqueFarmerIds(type: 'cash' | 'supplements'): string[] {
    const entries = type === 'cash' ? this.cashEntries : this.supplementEntries;
    const uniqueIds = new Set(entries.map(e => e.farmerId));
    return Array.from(uniqueIds).sort();
  }

  // Check if customer is in the customers list
  isCustomerInList(farmerId: string): boolean {
    return this.customers.some(c => c.farmerId === farmerId);
  }

  switchSubModule(subModule: 'cash' | 'supplements') {
    this.activeSubModule.set(subModule);
  }

  updateFarmerFilter(farmerId: string) {
    this.selectedFarmerId.set(farmerId);
  }

  handleCashEntryAdded(entry: AdvanceEntry) {
    this.cashEntryAdded.emit(entry);
  }

  handleCashEntryDeleted(entryId: string) {
    this.cashEntryDeleted.emit(entryId);
  }

  handleSupplementEntryAdded(entry: any) {
    this.supplementEntryAdded.emit(entry);
  }

  handleSupplementEntryDeleted(entryId: string) {
    this.supplementEntryDeleted.emit(entryId);
  }
}
