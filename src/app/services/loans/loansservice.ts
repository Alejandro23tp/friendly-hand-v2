import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

export interface Loan {
  id: number;
  participantId: number;
  amount: number;
  interestRate: number;
  totalInterest: number;
  projectedInterest: number;
  termWeeks: number;
  status: 'active' | 'paid' | 'defaulted' | 'deferred';
  dueDate: Date;
  annualCycleId: number;
  createdAt: Date;
  updatedAt: Date;
  participant?: {
    id: number;
    name: string;
  };
}

export interface CreateLoanDto {
  participantId: number;
  amount: number;
  year: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoansService {
  private apiUrl = `${environment.apiUrl}/loans`;

  constructor(private http: HttpClient) {}

  createLoan(loanData: CreateLoanDto): Observable<Loan> {
    return this.http.post<Loan>(this.apiUrl, loanData)
      .pipe(catchError(this.handleError));
  }

  getMyLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/my-loans`)
      .pipe(catchError(this.handleError));
  }

  getActiveLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/active`)
      .pipe(catchError(this.handleError));
  }

  getCompletedLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/completed`)
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
