import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RateChartManagementComponent } from './rate-chart-management.component';
import { RateChartListComponent } from './rate-chart-list.component';
import { RateChartEditComponent } from './rate-chart-edit.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		// Import standalone components instead of declaring them
		RateChartManagementComponent,
		RateChartListComponent,
		RateChartEditComponent
	],
	exports: [
		RateChartManagementComponent
	]
})
export class RateChartManagementModule {}


