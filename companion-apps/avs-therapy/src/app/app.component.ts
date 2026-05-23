import { Component } from '@angular/core';
import { AvsTherapyComponent } from './components/avs-therapy.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AvsTherapyComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'avs-therapy';
}
