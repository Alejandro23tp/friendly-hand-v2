import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  @Input() pageTitle: string = 'Dashboard';
  @Input() subtitle: string = 'Datos Generales';
  // Aquí puedes agregar lógica adicional si es necesario
}
