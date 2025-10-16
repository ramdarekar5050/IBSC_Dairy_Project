import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdvanceEntry } from '../cash.component';

@Component({
  selector: 'app-cash-add-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cash-add-entry.component.html',
  styleUrl: './cash-add-entry.component.css'
})
export class CashAddEntryComponent {
  @Output() save = new EventEmitter<AdvanceEntry>();

  form = signal<AdvanceEntry>({
    date: new Date().toISOString().slice(0, 10),
    farmerId: '',
    farmerName: '',
    description: '',
    amount: 0
  });

  update<K extends keyof AdvanceEntry>(key: K, value: AdvanceEntry[K]) {
    const current = this.form();
    this.form.set({ ...current, [key]: value });
  }

  onFarmerIdEnter() {
    // No DB connected: keep farmerName blank as requested
  }

  onSave() {
    const f = this.form();
    if (!f.farmerId || !f.date || !f.amount) {
      alert('Please fill required fields');
      return;
    }
    this.save.emit({ ...f });
    this.reset();
  }

  reset() {
    this.form.set({ date: new Date().toISOString().slice(0, 10), farmerId: '', farmerName: '', description: '', amount: 0 });
  }
}


