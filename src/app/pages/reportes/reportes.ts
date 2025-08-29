import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { Reportservice } from '../../services/report/reportservice';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { NotificationService } from '../../services/notification.service';

export interface ParticipantInfo {
  name: string;
  email: string;
  weeklyContribution: number;
}

export interface PaymentSummary {
  totalPaid: number;
  paymentEfficiency: number;
  weeksWithPayments: number;
  missedWeeks: number;
}

export interface Loan {
  id: number;
  amount: number;
  interestRate: string;
  status: string;
  createdAt: string;
  dueDate?: string;
  paymentsCount?: number;
  totalPaid?: number;
}

export interface LoanSummary {
  activeLoanAmount: number;
  loanStatus: string | Loan[];
  totalLoansReceived?: number;
  totalLoanAmount?: number;
  totalInterestPaid?: number;
  totalPrincipalPaid?: number;
}

export interface ParticipantReport {
  participantInfo: ParticipantInfo;
  paymentSummary: PaymentSummary;
  loanSummary?: LoanSummary;
  overallStatus: string;
  personalMessage?: string;
}

export interface ReportInfo {
  year: number;
  weekNumber: number;
  reportDate: string;
  progressPercentage: number;
  totalWeeks: number;
}

export interface ReportSummary {
  totalParticipants: number;
  participantsUpToDate: number;
  participantsWithMissedPayments: number;
  participantsWithPositiveBalance: number;
}

export interface ParticipantsReportsResponse {
  reportInfo: ReportInfo;
  summary: ReportSummary;
  participantReports: ParticipantReport[];
}

import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    TooltipModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    ToastModule
  ],
  providers: []
})
export class Reportes implements OnInit {
  reportsData: ParticipantsReportsResponse | null = null;
  loading = true;
  error: string | null = null;
  searchTerm = '';
  filteredReports: ParticipantReport[] = [];
  previewVisible = false;
  selectedParticipant: ParticipantReport | null = null;
  today = new Date();
  pdfLoading = false;

  constructor(
    private reportService: Reportservice,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.error = null;
    
    this.reportService.getParticipantsReports().subscribe({
      next: (data) => {
        this.reportsData = data;
        this.filteredReports = [...data.participantReports];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.error = 'Error al cargar los reportes. Por favor, intente de nuevo más tarde.';
        this.loading = false;
        this.notificationService.error('No se pudieron cargar los reportes');
      }
    });
  }

  onSearch() {
    if (!this.reportsData) return;
    
    const searchTerm = this.searchTerm.toLowerCase().trim();
    if (!searchTerm) {
      this.filteredReports = [...this.reportsData.participantReports];
      return;
    }
    
    this.filteredReports = this.reportsData.participantReports.filter(participant => 
      participant.participantInfo.name.toLowerCase().includes(searchTerm) ||
      participant.participantInfo.email.toLowerCase().includes(searchTerm) ||
      participant.overallStatus.toLowerCase().includes(searchTerm)
    );
  }

  previewReport(participant: ParticipantReport) {
    this.selectedParticipant = participant;
    this.previewVisible = true;
  }

  generatePdf(participant: ParticipantReport) {
    if (typeof jsPDF === 'undefined') {
      this.notificationService.error('No se pudo cargar el generador de PDF');
      return;
    }

    this.pdfLoading = true;
    
    try {
      const doc = new jsPDF();
      const margin = 15;
      let y = 20;
      
      // Add logo and title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(30, 64, 175); // Blue-700
      doc.text('Reporte de Participante', margin, y);
      
      // Add date
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text(`Generado el: ${this.today.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, margin, y + 10);
      
      // Add participant info section
      y += 25;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text('Información del Participante', margin, y);
      
      // Add participant details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      y += 8;
      
      const participantInfo = [
        { label: 'Nombre:', value: participant.participantInfo.name },
        { label: 'Email:', value: participant.participantInfo.email },
        { label: 'Estado:', value: participant.overallStatus },
        { label: 'Aportación Semanal:', value: this.formatCurrency(participant.participantInfo.weeklyContribution) }
      ];
      
      participantInfo.forEach(info => {
        doc.text(`${info.label} ${info.value}`, margin, y);
        y += 7;
      });
      
      // Add payment summary
      y += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Resumen de Pagos', margin, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      y += 8;
      
      const paymentInfo = [
        { label: 'Total Pagado:', value: this.formatCurrency(participant.paymentSummary.totalPaid) },
        { label: 'Eficiencia de Pago:', value: `${participant.paymentSummary.paymentEfficiency.toFixed(1)}%` },
        { label: 'Semanas con Pagos:', value: participant.paymentSummary.weeksWithPayments },
        { label: 'Semanas Atrasadas:', value: participant.paymentSummary.missedWeeks }
      ];
      
      paymentInfo.forEach(info => {
        doc.text(`${info.label} ${info.value}`, margin, y);
        y += 7;
      });
      
      // Add loan info if exists
      if (participant.loanSummary && participant.loanSummary.activeLoanAmount > 0) {
        y += 7;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Información de Préstamos', margin, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        y += 8;
        
        // Mostrar resumen de préstamos
        doc.text(`Préstamos recibidos: ${participant.loanSummary.totalLoansReceived || 0}`, margin, y);
        y += 7;
        
        doc.text(`Monto total de préstamos: ${this.formatCurrency(participant.loanSummary.totalLoanAmount || 0)}`, margin, y);
        y += 7;
        
        doc.text(`Monto activo actual: ${this.formatCurrency(participant.loanSummary.activeLoanAmount || 0)}`, margin, y);
        y += 7;
        
        doc.text(`Intereses pagados: ${this.formatCurrency(participant.loanSummary.totalInterestPaid || 0)}`, margin, y);
        y += 7;
        
        doc.text(`Capital pagado: ${this.formatCurrency(participant.loanSummary.totalPrincipalPaid || 0)}`, margin, y);
        y += 10;
        
        // Mostrar estado de préstamos individuales
        if (this.isLoanStatusArray(participant.loanSummary.loanStatus) && participant.loanSummary.loanStatus.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('Estado de Préstamos:', margin, y);
          y += 7;
          
          (participant.loanSummary.loanStatus as Loan[]).forEach((loan: Loan) => {
            // Traducir estados al español
            let status = loan.status.toLowerCase();
            let statusText = '';
            
            // Definir color según el estado
            if (status === 'paid') {
              doc.setDrawColor(34, 197, 94); // Verde
              statusText = 'Pagado';
            } else if (status === 'deferred') {
              doc.setDrawColor(234, 179, 8); // Amarillo
              statusText = 'Diferido';
            } else if (status === 'overdue') {
              doc.setDrawColor(239, 68, 68); // Rojo
              statusText = 'Vencido';
            } else {
              doc.setDrawColor(59, 130, 246); // Azul (default)
              statusText = status.charAt(0).toUpperCase() + status.slice(1);
            }
            
            // Dibujar punto de color
            doc.setFillColor(doc.getDrawColor());
            doc.circle(margin + 5, y - 2, 2, 'F');
            
            // Restaurar color de texto
            doc.setTextColor(15, 23, 42); // Slate-900
            
            // Formatear fecha de vencimiento
            const dueDate = loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'Sin fecha';
            const loanText = `${this.formatCurrency(loan.amount)} - ${statusText} (Vence: ${dueDate})`;
            
            doc.text(loanText, margin + 10, y);
            y += 7;
          });
          
          // Restaurar estilos
          doc.setFont('helvetica', 'normal');
          y += 3;
        }
        
        // Mostrar información de semanas recientes si está disponible
        const recentWeeks = (participant as any).recentWeeks;
        if (recentWeeks && Array.isArray(recentWeeks) && recentWeeks.length > 0) {
          y += 5;
          doc.setFont('helvetica', 'bold');
          doc.text('Actividad Reciente:', margin, y);
          doc.setFont('helvetica', 'normal');
          y += 7;
          
          recentWeeks.forEach((week: any) => {
            const weekText = `Semana ${week.weekNumber}: ${week.payment?.made ? 'Pagado' : 'Pendiente'}`;
            doc.text(weekText, margin + 10, y);
            y += 6;
          });
        }
      }
      
      // Add personal message if exists
      if (participant.personalMessage) {
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Mensaje Personal:', margin, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        y += 7;
        
        // Split message into multiple lines if too long
        const splitMessage = doc.splitTextToSize(participant.personalMessage, 180);
        doc.text(splitMessage, margin, y);
      }
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Página ${i} de ${pageCount}`, 
          doc.internal.pageSize.getWidth() - 20, 
          doc.internal.pageSize.getHeight() - 10,
          { align: 'right' as const }
        );
      }
      
      // Save the PDF
      doc.save(`reporte-${participant.participantInfo.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      this.notificationService.success('El reporte se ha descargado correctamente');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.notificationService.error('Ocurrió un error al generar el PDF');
    } finally {
      this.pdfLoading = false;
    }
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getStatusClass(status: string): string {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    
    switch(status.toLowerCase()) {
      case 'al día':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'atrasado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'saldo a favor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }
  
  getStatusColor(status: string): string {
    if (!status) return 'text-gray-500';
    
    switch(status.toLowerCase()) {
      case 'al día':
        return 'text-green-500';
      case 'atrasado':
        return 'text-red-500';
      case 'saldo a favor':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  }
  
  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'al día':
        return 'pi pi-check-circle';
      case 'atrasado':
        return 'pi pi-exclamation-triangle';
      case 'en mora':
        return 'pi pi-times-circle';
      default:
        return 'pi pi-info-circle';
    }
  }

  isLoanStatusArray(loanStatus: any): loanStatus is Loan[] {
    return Array.isArray(loanStatus);
  }
}
