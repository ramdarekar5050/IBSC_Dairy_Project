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

  addCentre() {
    const id = this.centreId().trim();
    const loc = this.location().trim();
    if (!id || !loc) {
      alert('Enter Centre ID and Location');
      return;
    }
    this.centres.update(list => [...list, { centreId: id, location: loc }]);
    this.centreId.set('');
    this.location.set('');
  }
}