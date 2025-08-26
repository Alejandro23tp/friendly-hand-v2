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
   * Pay all active participants for a specific week
   * @param year Year of the cycle
   * @param weekNumber Week number (optional, defaults to current week)
   * @param excludeIds Array of participant IDs to exclude (optional)
   * @returns Result of the bulk payment operation
   */
  bulkPayAllParticipants(year: number, weekNumber?: number, excludeIds: number[] = []): Observable<{
    message: string;
    year: number;
    weekNumber: number;
    currentWeekCalculated: number;
    totalParticipants: number;
    paymentsCreated: number;
    paymentsSkipped: number;
    details: any[];
  }> {
    let params: any = { year };
    
    if (weekNumber) {
      params.weekNumber = weekNumber;
    }
    
    if (excludeIds.length > 0) {
      params.excludeIds = excludeIds.join(',');
    }
    
    return this.http.get<{
      message: string;
      year: number;
      weekNumber: number;
      currentWeekCalculated: number;
      totalParticipants: number;
      paymentsCreated: number;
      paymentsSkipped: number;
      details: any[];
    }>(`${this.apiUrl}/bulk-pay`, { params });
  }
}
