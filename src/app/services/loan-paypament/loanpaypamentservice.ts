import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoanPaymentRequest {
  participantId: number;
  loanId: number;
  amount: number;
  paymentType: 'principal' | 'interest' | 'full';
  year: number;
  weekNumber: number;
}

export interface LoanPaymentResponse {
  message: string;
  // Add other response fields as needed
}

export interface LoanPayment {
  id: number;
  loanId: number;
  participantId: number;
  amount: number;
  paymentType: 'principal' | 'interest' | 'full';
  weekNumber: number;
  year: number;
  createdAt: string;
  weeklySummaryId: number;
}

@Injectable({
  providedIn: 'root'
})
export class Loanpaypamentservice {
  private apiUrl = `${environment.apiUrl}/loan-payments`;

  constructor(private http: HttpClient) {}

  /**
   * Creates a new loan payment
   * @param paymentData The payment data including participantId, loanId, amount, paymentType, year, and weekNumber
   * @returns Observable with the payment response
   */
  /**
   * Gets all payments for a specific loan
   * @param loanId The ID of the loan to get payments for
   * @returns Observable with array of loan payments
   */
  getPaymentsByLoanId(loanId: number): Observable<LoanPayment[]> {
    if (loanId <= 0) {
      throw new Error('El ID del préstamo debe ser un número positivo');
    }
    return this.http.get<LoanPayment[]>(`${this.apiUrl}/${loanId}`);
  }

  /**
   * Creates a new loan payment
   * @param paymentData The payment data including participantId, loanId, amount, paymentType, year, and weekNumber
   * @returns Observable with the payment response
   */
  createLoanPayment(paymentData: LoanPaymentRequest): Observable<LoanPaymentResponse> {
    // Validar tipo de pago
    if (!['principal', 'interest', 'full'].includes(paymentData.paymentType)) {
      throw new Error('Tipo de pago inválido. Debe ser uno de: principal, interest o full');
    }

    // Validar número de semana
    if (paymentData.weekNumber < 1 || paymentData.weekNumber > 52) {
      throw new Error('El número de semana debe estar entre 1 y 52');
    }

    // Validar números positivos
    if (paymentData.amount <= 0 || paymentData.participantId <= 0 || paymentData.loanId <= 0) {
      throw new Error('El monto, ID del participante e ID del préstamo deben ser números positivos');
    }

    return this.http.post<LoanPaymentResponse>(this.apiUrl, paymentData);
  }
}
