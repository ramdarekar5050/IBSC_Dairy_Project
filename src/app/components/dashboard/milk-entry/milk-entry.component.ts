import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-milk-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './milk-entry.component.html',
  styleUrl: './milk-entry.component.css'
})
export class MilkEntryComponent {
  session = signal<'morning' | 'evening'>('morning');
}


