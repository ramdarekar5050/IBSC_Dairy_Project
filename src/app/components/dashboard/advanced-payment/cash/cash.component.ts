import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashAddEntryComponent } from './cash-add-entry/cash-add-entry.component';
import { CashShowComponent } from './cash-show/cash-show.component';

export interface AdvanceEntry {
  date: string;
  farmerId: string;
  farmerName: string;
  description: string;
  amount: number;
}

@Component({
  selector: 'app-advanced-payment-cash',
  standalone: true,
  imports: [CommonModule, FormsModule, CashAddEntryComponent, CashShowComponent],
  templateUrl: './cash.component.html',
  styleUrl: './cash.component.css'
})
export class AdvancedPaymentCashComponent {
  activeTab = signal<'add' | 'show'>('add');
  entries = signal<AdvanceEntry[]>([]);

  switchTab(tab: 'add' | 'show') {
    this.activeTab.set(tab);
  }

  handleAddEntry(entry: AdvanceEntry) {
    this.entries.update(list => [entry, ...list]);
    this.activeTab.set('show');
  }
}


