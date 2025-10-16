import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-centre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-centre.component.html',
  styleUrl: './add-centre.component.css'
})
export class AddCentreComponent {
  centreId = signal('');
  location = signal('');

  centres = signal<Array<{ centreId: string; location: string }>>([]);

  editingCentreIndex = signal<number | null>(null);
  editingCentre = signal<{ centreId: string; location: string }>({ centreId: '', location: '' });

  addCentre() {
    const id = this.centreId().trim();
    const loc = this.location().trim();
    if (!id || !loc) {
      alert('Enter Centre ID and Location');
      return;
    }
    const exists = this.centres().some(c => c.centreId.toLowerCase() === id.toLowerCase());
    if (exists) {
      alert('Centre ID already exists');
      return;
    }
    this.centres.update(list => [...list, { centreId: id, location: loc }]);
    this.centreId.set('');
    this.location.set('');
  }

  removeCentre(index: number) {
    const current = this.centres();
    if (!current[index]) return;
    const confirmed = window.confirm(`Delete centre ${current[index].centreId} - ${current[index].location}?`);
    if (!confirmed) return;
    this.centres.set(current.filter((_, i) => i !== index));
  }

  startEditCentre(index: number) {
    const current = this.centres();
    const target = current[index];
    if (!target) return;
    this.editingCentreIndex.set(index);
    this.editingCentre.set({ centreId: target.centreId, location: target.location });
  }

  updateEditingCentre(key: 'centreId' | 'location', value: string) {
    const current = this.editingCentre();
    this.editingCentre.set({ ...current, [key]: value });
  }

  saveEditCentre(index: number) {
    const { centreId, location } = this.editingCentre();
    const id = centreId.trim();
    const loc = location.trim();
    if (!id || !loc) return;
    const list = [...this.centres()];
    // Prevent duplicate IDs except for the row being edited
    const duplicate = list.some((c, i) => i !== index && c.centreId.toLowerCase() === id.toLowerCase());
    if (duplicate) {
      alert('Another centre with the same ID exists');
      return;
    }
    list[index] = { centreId: id, location: loc };
    this.centres.set(list);
    this.cancelEditCentre();
  }

  cancelEditCentre() {
    this.editingCentreIndex.set(null);
    this.editingCentre.set({ centreId: '', location: '' });
  }
}