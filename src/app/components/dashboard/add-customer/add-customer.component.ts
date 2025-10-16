import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.css'
})
export class AddCustomerComponent {
  customers = signal<Array<{ farmerId: string; farmerName: string }>>([]);
  newCustomer = signal<{ farmerId: string; farmerName: string }>({ farmerId: '', farmerName: '' });
  editingCustomerIndex = signal<number | null>(null);
  editingCustomer = signal<{ farmerId: string; farmerName: string }>({ farmerId: '', farmerName: '' });

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

  startEditCustomer(index: number) {
    const current = this.customers();
    const target = current[index];
    if (!target) return;
    this.editingCustomerIndex.set(index);
    this.editingCustomer.set({ farmerId: target.farmerId, farmerName: target.farmerName });
  }

  updateEditingCustomer(key: 'farmerId' | 'farmerName', value: string) {
    const current = this.editingCustomer();
    this.editingCustomer.set({ ...current, [key]: value });
  }

  saveEditCustomer(index: number) {
    const { farmerId, farmerName } = this.editingCustomer();
    const id = farmerId.trim();
    const name = farmerName.trim();
    if (!id || !name) return;
    const list = [...this.customers()];
    list[index] = { farmerId: id, farmerName: name };
    this.customers.set(list);
    this.cancelEditCustomer();
  }

  cancelEditCustomer() {
    this.editingCustomerIndex.set(null);
    this.editingCustomer.set({ farmerId: '', farmerName: '' });
  }
}


