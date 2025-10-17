import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monthly-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-welcome">
      <h3>Monthly Reports</h3>
      <p>This section will show monthly summaries and trends.</p>
    </div>
  `
})
export class MonthlyReportsComponent {}


