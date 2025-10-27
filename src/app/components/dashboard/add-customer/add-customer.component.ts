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
  customers = signal<Array<{ farmerId: string; farmerName: string; address: string; mobileNumber: string }>>([]);
  newCustomer = signal<{ farmerId: string; farmerName: string; address: string; mobileNumber: string }>({ 
    farmerId: '', 
    farmerName: '', 
    address: '', 
    mobileNumber: '' 
  });
  editingCustomerIndex = signal<number | null>(null);
  editingCustomer = signal<{ farmerId: string; farmerName: string; address: string; mobileNumber: string }>({ 
    farmerId: '', 
    farmerName: '', 
    address: '', 
    mobileNumber: '' 
  });

  updateNewCustomer<K extends keyof { farmerId: string; farmerName: string; address: string; mobileNumber: string }>(key: K, value: { farmerId: string; farmerName: string; address: string; mobileNumber: string }[K]) {
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
}


