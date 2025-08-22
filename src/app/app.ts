import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ThemeService } from './services/theme.service';
import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { HeaderComponent } from './shared/components/header/header';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth/authservice';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    NgxSonnerToaster, 
    SidebarComponent, 
    HeaderComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('friendly-hand');
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private authService = inject(AuthService);
  
  // Estado de autenticación
  isAuthenticated = false;
  
  // Título y subtítulo actuales
  pageTitle = signal('Dashboard');
  pageSubtitle = signal('Datos Generales');
  
  constructor() {
    // Suscribirse a cambios en la autenticación
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  ngOnInit() {
    this.themeService.initializeTheme();
    
    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateHeaderTitles();
    });
  }

  private updateHeaderTitles() {
    const currentRoute = this.router.routerState.snapshot.url;
    
    // Actualizar títulos según la ruta
    if (currentRoute.includes('participantes')) {
      this.pageTitle.set('Participantes');
      this.pageSubtitle.set('Gestión de participantes');
    } else if (currentRoute.includes('dashboard')) {
      this.pageTitle.set('Dashboard');
      this.pageSubtitle.set('Datos Generales');
    }
    // Añade más rutas según sea necesario
  }
}
