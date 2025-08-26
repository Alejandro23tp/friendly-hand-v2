import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentDto {
  id: number;
  participantId: number;
  amount: number;
  year: number;
  weekNumber: number;
  annualCycleId: number;
  paymentDate: string;
  createdAt: string;
  participant?: {
    id: number;
    name: string;
    email: string;
  };
  // Other properties from the API response
}

export interface CreatePaymentDto {
  participantId: number;
  year: number;
  weekNumber: number;
  // No paymentDate as it's set server-side
}

export interface CreateWeeklyPaymentsDto {
  year: number;
  weekNumber?: number;
  excludeParticipantIds?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;
  private http = inject(HttpClient);

  /**
   * Create a new payment (admin only)
   * @param paymentData Payment data to create
   * @returns Created payment data
   */
  createPayment(participantId: number, paymentData: { weekNumber: number; year: number }): Observable<PaymentDto> {
    return this.http.post<PaymentDto>(`${this.apiUrl}/${participantId}`, paymentData);
  }

  /**
   * Get all payments for the current user
   * @returns Array of user's payments
   */
  getMyPayments(): Observable<PaymentDto[]> {
    return this.http.get<PaymentDto[]>(`${this.apiUrl}/my-payments`);
  }

  /**
   * Get all payments for a specific cycle year (admin only)
   * @param year Cycle year
   * @returns Array of payments for the specified year
   */
  getCyclePayments(year: number): Observable<PaymentDto[]> {
    return this.http.get<PaymentDto[]>(`${this.apiUrl}/cycle/${year}`);
  }

  /**
   * Create weekly payments for all active participants (admin only)
   * @param weeklyPaymentsData Weekly payments data
   * @returns Result of the operation
   */
  createWeeklyPayments(weeklyPaymentsData: CreateWeeklyPaymentsDto): Observable<{
    totalParticipants: number;
    paymentsCreated: number;
    paymentsSkipped: number;
    details: Array<{
      participantId: number;
      name: string;
      status: 'created' | 'skipped';
      amount: number;
      reason?: string;
    }>;
  }> {
    return this.http.post<{
      totalParticipants: number;
      paymentsCreated: number;
      paymentsSkipped: number;
      details: Array<{
        participantId: number;
        name: string;
        status: 'created' | 'skipped';
        amount: number;
        reason?: string;
      }>;
    }>(`${this.apiUrl}/weekly`, weeklyPaymentsData);
  }
}
