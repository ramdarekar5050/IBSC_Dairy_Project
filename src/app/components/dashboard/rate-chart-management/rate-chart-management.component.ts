import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RateChartListComponent } from './rate-chart-list.component';
import { RateChartEditComponent } from './rate-chart-edit.component';

export interface RateChartRow {
	id: string;
	fat: number;
	snf: number;
	ratePerLiter: number;
	effectiveFrom: string;
}

@Component({
	selector: 'app-rate-chart-management',
	standalone: true,
	imports: [CommonModule, RateChartListComponent, RateChartEditComponent],
	templateUrl: './rate-chart-management.component.html',
	styleUrls: ['./rate-chart-management.component.css']
})
export class RateChartManagementComponent {
	rateCharts = signal<RateChartRow[]>([]);
	selectedRow = signal<RateChartRow | null>(null);
	showEditor = signal<boolean>(false);

	onCreate() {
		this.selectedRow.set(null);
		this.showEditor.set(true);
	}

	onEdit(row: RateChartRow) {
		this.selectedRow.set({ ...row });
		this.showEditor.set(true);
	}

	onDelete(row: RateChartRow) {
		const confirmed = window.confirm(`Delete rate for FAT ${row.fat}% / SNF ${row.snf}% effective ${row.effectiveFrom}?`);
		if (!confirmed) return;
		this.rateCharts.set(this.rateCharts().filter(r => r.id !== row.id));
	}

	onSaved(row: RateChartRow) {
		const existing = this.rateCharts().findIndex(r => r.id === row.id);
		if (existing >= 0) {
			const updated = [...this.rateCharts()];
			updated[existing] = row;
			this.rateCharts.set(updated);
		} else {
			this.rateCharts.update(list => [...list, row]);
		}
		this.showEditor.set(false);
	}

	onCancelEdit() {
		this.showEditor.set(false);
	}
}


