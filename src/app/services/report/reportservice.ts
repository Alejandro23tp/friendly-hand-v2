import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ParticipantReport {
  participantInfo: {
    id: number;
    name: string;
    email: string;
    shares: number;
    isActive: boolean;
    memberSince: string;
    weeklyContribution: number;
  };
  paymentSummary: {
    totalPaid: number;
    expectedTotal: number;
    paymentEfficiency: number;
    weeksWithPayments: number;
    missedWeeks: number;
    averageWeeklyPayment: number;
    upToDate: boolean;
  };
  loanSummary: {
    totalLoansReceived: number;
    totalLoanAmount: number;
    activeLoanAmount: number;
    totalInterestPaid: number;
    totalPrincipalPaid: number;
    loanStatus: string;
  };
  personalBalance: {
    currentBalance: number;
    status: string;
    explanation: string;
  };
  personalMessage: string;
  overallStatus: string;
}

export interface ParticipantsReportsResponse {
  reportInfo: {
    year: number;
    weekNumber: number;
    reportDate: string;
    totalWeeks: number;
    progressPercentage: number;
  };
  summary: {
    totalParticipants: number;
    reportsGenerated: number;
    reportsWithErrors: number;
    participantsUpToDate: number;
    participantsWithMissedPayments: number;
    participantsWithPositiveBalance: number;
  };
  participantReports: ParticipantReport[];
}

@Injectable({
  providedIn: 'root'
})
export class Reportservice {
  private apiUrl = (environment.apiUrl + '/payments'); // Update with your API base URL

  constructor(private http: HttpClient) {}

  /**
   * Get participants reports
   * @returns Observable with participants reports data
   */
  getParticipantsReports(): Observable<ParticipantsReportsResponse> {
    return this.http.get<ParticipantsReportsResponse>(`${this.apiUrl}/participants-reports`);
  }
}
