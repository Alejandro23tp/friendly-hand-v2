import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { AuthComponent } from './pages/auth/auth';
import { Dashboard } from './pages/dashboard/dashboard';
import { Participantes } from './pages/participantes/participantes';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth/authservice';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
    title: 'Iniciar sesión',
    canActivate: [() => {
      const authService = inject(AuthService);
      const router = inject(Router);
      return !authService.isAuthenticated ? true : router.createUrlTree(['/dashboard']);
    }]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard',
    canActivate: [AuthGuard]
  },
  {
    path: 'participantes',
    component: Participantes,
    title: 'Participantes',
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
