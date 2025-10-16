import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvanceEntry } from '../cash.component';

@Component({
  selector: 'app-cash-show',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cash-show.component.html',
  styleUrl: './cash-show.component.css'
})
export class CashShowComponent {
  @Input() entries: AdvanceEntry[] = [];
}


