import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FeedForm {
  farmerId: string;
  farmerName: string;
  feedName: string;
  rate: number | '';
}

@Component({
  selector: 'app-feed-distribution',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed-distribution.component.html',
  styleUrl: './feed-distribution.component.css'
})
export class FeedDistributionComponent {
  @Output() backToDashboard = new EventEmitter<void>();

  feedForm = signal<FeedForm>({
    farmerId: '',
    farmerName: '',
    feedName: '',
    rate: ''
  });

  feedEntries = signal<Array<{
    farmerId: string;
    farmerName: string;
    feedName: string;
    rate: number;
  }>>([]);

  editingIndex = signal<number | null>(null);

  updateFeedForm<K extends keyof FeedForm>(key: K, value: FeedForm[K]) {
    const current = this.feedForm();
    this.feedForm.set({ ...current, [key]: value });
  }

  onFarmerIdChange(id: string) {
    const current = this.feedForm();
    this.feedForm.set({ ...current, farmerId: id, farmerName: '' });
  }

  saveFeedEntry() {
    const form = this.feedForm();
    if (!form.farmerId || !form.farmerName || !form.feedName || !form.rate) {
      alert('Please fill all fields');
      return;
    }

    const confirmed = confirm(`Save feed entry?\n\nFarmer: ${form.farmerId} - ${form.farmerName}\nFeed: ${form.feedName}\nRate: ${form.rate}`);
    if (!confirmed) {
      return;
    }

    const entry = {
      farmerId: form.farmerId.trim(),
      farmerName: form.farmerName.trim(),
      feedName: form.feedName.trim(),
      rate: Number(form.rate)
    };

    const editIndex = this.editingIndex();
    if (editIndex !== null) {
      const list = [...this.feedEntries()];
      list[editIndex] = entry;
      this.feedEntries.set(list);
      this.editingIndex.set(null);
    } else {
      this.feedEntries.update(list => [...list, entry]);
    }

    this.resetForm();
  }

  resetForm() {
    this.feedForm.set({
      farmerId: '',
      farmerName: '',
      feedName: '',
      rate: ''
    });
  }

  removeFeedEntry(index: number) {
    const current = this.feedEntries();
    const entry = current[index];
    if (!entry) return;
    const confirmed = window.confirm(`Delete feed entry for ${entry.farmerId} - ${entry.farmerName}?`);
    if (!confirmed) return;
    const updated = current.filter((_, i) => i !== index);
    this.feedEntries.set(updated);
  }

  editFeedEntry(index: number) {
    const current = this.feedEntries();
    const entry = current[index];
    if (!entry) return;
    this.feedForm.set({
      farmerId: entry.farmerId,
      farmerName: entry.farmerName,
      feedName: entry.feedName,
      rate: entry.rate
    });
    this.editingIndex.set(index);
  }

  goBackToDashboard() {
    this.backToDashboard.emit();
  }
}

