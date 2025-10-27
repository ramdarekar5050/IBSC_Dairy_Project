import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-milk-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './milk-entry.component.html',
  styleUrl: './milk-entry.component.css'
})
export class MilkEntryComponent {
  milkSession = signal<'morning' | 'evening'>('morning');
  selectedMilkSubModule = signal<'morning' | 'evening' | null>(null);

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

  editingMilkIndex = signal<number | null>(null);

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
    const current = this.milkEntryForm();
    this.milkEntryForm.set({ ...current, farmerId: id, farmerName: '' });
  }

  saveMilkEntry() {
    const form = this.milkEntryForm();
    if (!form.farmerId || !form.liters || !form.fat || !form.snf) {
      alert('Please fill all fields');
      return;
    }
    
    // Ask for confirmation with Yes/No
    const confirmed = confirm(`Save ${this.milkSession() === 'morning' ? 'Morning' : 'Evening'} entry?\n\nFarmer: ${form.farmerId}\nLiters: ${form.liters}\nFat: ${form.fat}%\nSNF: ${form.snf}%`);
    if (!confirmed) {
      return;
    }
    
    const litersNum = Number(form.liters);
    const fatNum = Number(form.fat);
    const snfNum = Number(form.snf);
    const rateNum = form.rate === '' ? 0 : Number(form.rate);
    const total = +(litersNum * rateNum).toFixed(2);

    const entry = {
      session: this.milkSession(),
      date: form.date,
      farmerId: form.farmerId.trim(),
      farmerName: form.farmerName.trim(),
      liters: litersNum,
      fat: fatNum,
      snf: snfNum,
      rate: rateNum,
      totalAmount: total
    } as const;

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
  }

  removeMilkEntry(index: number) {
    const current = this.milkEntries();
    const entry = current[index];
    if (!entry) return;
    const confirmed = window.confirm(`Are you sure you want to delete this ${entry.session} entry?\n\nDate: ${entry.date}\nFarmer ID: ${entry.farmerId}\nLiters: ${entry.liters}`);
    if (!confirmed) return;
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
}


