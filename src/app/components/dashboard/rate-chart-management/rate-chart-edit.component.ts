import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RateChartRow } from './rate-chart-management.component';

@Component({
	selector: 'app-rate-chart-edit',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './rate-chart-edit.component.html',
	styleUrls: ['./rate-chart-edit.component.css']
})
export class RateChartEditComponent implements OnChanges {
	@Input() row: RateChartRow | null = null;
	@Output() saved = new EventEmitter<RateChartRow>();
	@Output() cancelled = new EventEmitter<void>();

	form: { id: string; effectiveFrom: string; fat: number | ''; snf: number | ''; ratePerLiter: number | '' } = {
		id: '',
		effectiveFrom: new Date().toISOString().slice(0, 10),
		fat: '',
		snf: '',
		ratePerLiter: ''
	};

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['row']) {
			if (this.row) {
				this.form = {
					id: this.row.id,
					effectiveFrom: this.row.effectiveFrom,
					fat: this.row.fat,
					snf: this.row.snf,
					ratePerLiter: this.row.ratePerLiter
				};
			} else {
				this.resetForm();
			}
		}
	}

	resetForm() {
		this.form = {
			id: '',
			effectiveFrom: new Date().toISOString().slice(0, 10),
			fat: '',
			snf: '',
			ratePerLiter: ''
		};
	}

	save() {
		const fat = Number(this.form.fat);
		const snf = Number(this.form.snf);
		const rate = Number(this.form.ratePerLiter);
		if (!this.form.effectiveFrom || isNaN(fat) || isNaN(snf) || isNaN(rate)) {
			alert('Please fill all fields correctly.');
			return;
		}
		const model: RateChartRow = {
			id: this.form.id || `rate_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
			effectiveFrom: this.form.effectiveFrom,
			fat,
			snf,
			ratePerLiter: rate
		};
		this.saved.emit(model);
		this.resetForm();
	}
}


