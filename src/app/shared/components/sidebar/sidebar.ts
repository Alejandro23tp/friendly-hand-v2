import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth/authservice';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    AvatarModule,
    ButtonModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  themeService = inject(ThemeService);

  menuItems = [
    { label: 'Dashboard', icon: 'pi pi-th-large', route: '/dashboard' },
    { label: 'Participantes', icon: 'pi pi-users', route: '/participantes' },
    { label: 'Clientes', icon: 'pi pi-briefcase', route: '/dashboard/clientes' },
    { label: 'Reportes', icon: 'pi pi-chart-line', route: '/dashboard/reportes' },
  ];

  get isDark() {
    return this.themeService.isDark();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
