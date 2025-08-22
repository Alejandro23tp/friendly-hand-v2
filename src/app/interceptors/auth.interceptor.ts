import { HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/authservice';

export function authInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Obtener el token del servicio de autenticación
  const token = authService.getToken();
  
  // Clonar la solicitud y agregar el token de autorización si existe
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Manejar la solicitud y capturar errores de autenticación
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token inválido o expirado
        authService.logout();
        router.navigate(['/auth']);
      }
      return throwError(() => error);
    })
  );
}
