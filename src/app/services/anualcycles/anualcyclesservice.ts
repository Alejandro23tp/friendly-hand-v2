import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

export interface AnnualCycle {
  id: number;
  year: number;
  status: 'active' | 'closed' | 'pending';
  totalFunds?: number;
  totalInterest?: number;
  projectedInterest?: number;
  totalShares?: number;
  interestPerShare?: number;
  closedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AnnualCyclesService {
  private apiUrl = `${environment.apiUrl}/annual-cycles`;

  constructor(private http: HttpClient) {}

  activateCycle(year: number): Observable<AnnualCycle> {
    return this.http.post<AnnualCycle>(`${this.apiUrl}/activate`, { year })
      .pipe(catchError(this.handleError));
  }

  closeCycle(year: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/close`, { year })
      .pipe(catchError(this.handleError));
  }

  getActiveCycle(): Observable<AnnualCycle | null> {
    return this.http.get<AnnualCycle | null>(`${this.apiUrl}/active`)
      .pipe(catchError(this.handleError));
  }

  getAllCycles(): Observable<AnnualCycle[]> {
    return this.http.get<AnnualCycle[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión con el servidor';
    } else if (error.status === 401) {
      errorMessage = 'No autorizado';
    } else if (error.status === 403) {
      errorMessage = 'No tiene permisos para realizar esta acción';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado';
    }
    return throwError(() => new Error(errorMessage));
  }
}
