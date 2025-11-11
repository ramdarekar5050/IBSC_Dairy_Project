import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RateChartRow } from './rate-chart-management.component';

@Component({
	selector: 'app-rate-chart-list',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './rate-chart-list.component.html'
})
export class RateChartListComponent {
	@Input() rates: RateChartRow[] = [];
	@Output() edit = new EventEmitter<RateChartRow>();
	@Output() delete = new EventEmitter<RateChartRow>();
}


