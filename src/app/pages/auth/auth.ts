import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../services/auth/authservice';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    TooltipModule
  ],
  providers: [NotificationService]
})
export class AuthComponent implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = true;
  loading = false;
  currentYear = new Date().getFullYear();

  // Inyección de dependencias
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  ngOnInit() {
    // Apply the initial theme
    this.themeService.applyTheme(this.themeService.theme());
  }

  // Method to toggle theme
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.notificationService.error('Por favor ingrese correo y contraseña');
      return;
    }
  
    this.loading = true;
  
    try {
      // El servicio ahora maneja el almacenamiento del token y usuario
      await this.authService.login(this.email, this.password);
      
      this.loading = false;
      this.notificationService.success('Inicio de sesión exitoso');
      this.router.navigate(['/dashboard']);
  
    } catch (err: any) {
      this.loading = false;
  
      const errorMessage = err?.error?.message || err?.message || 'Error al iniciar sesión';
      this.notificationService.error(errorMessage);
    }
  }
  
}
