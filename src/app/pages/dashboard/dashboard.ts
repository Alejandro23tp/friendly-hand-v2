import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';

// PrimeNG Components
import { ProgressSpinner } from 'primeng/progressspinner';
import { Table } from 'primeng/table';
import { ParticipantDialogComponent } from '../../shared/components/participant-dialog/participant-dialog.component';

// Models
import { Participante } from '../../models/participante.model';

// Services
import { AnnualCyclesService, AnnualCycle } from '../../services/anualcycles/anualcyclesservice';
import { LoansService, Loan } from '../../services/loans/loansservice';
import { AuthService } from '../../services/auth/authservice';
import { ParticipanteService } from '../../services/participantes/participanteservice';
import { ThemeService } from '../../services/theme.service';
import { Loanpaypamentservice, LoanPaymentRequest } from '../../services/loan-paypament/loanpaypamentservice';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // PrimeNG Modules
    ButtonModule,
    AvatarModule,
    MenuModule,
    AvatarGroupModule,
    TooltipModule,
    RippleModule,
    TieredMenuModule,
    CardModule,
    TableModule,
    ToastModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    DatePickerModule,
    ProgressSpinnerModule,
    SelectModule,
    RadioButtonModule,
    // Custom Components
    ParticipantDialogComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss', './_tables.scss'],
  providers: [MessageService, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Dashboard implements OnInit {
  // User info
  user: any;

  // Annual Cycles
  activeCycle: AnnualCycle | null = null;
  allCycles: AnnualCycle[] = [];
  showNewCycleDialog = false;
  newCycleYear = new Date().getFullYear();

  // Loans
  myLoans: Loan[] = [];
  activeLoans: Loan[] = [];
  completedLoans: Loan[] = [];
  showNewLoanDialog = false;
  newLoan = {
    participantId: 0,
    amount: 0,
    year: this.activeCycle?.year || new Date().getFullYear()
  };

  // Participant Dialog
  showParticipantDialog: boolean = false;
  
  // Payment Dialog
  showPaymentDialog = false;
  paymentData: any = {
    loanId: 0,
    participantId: 0,
    amount: 0,
    paymentType: 'full',
    year: new Date().getFullYear(),
    weekNumber: 1
  };
  
  // Store the selected loan for payment calculation
  private selectedLoanForPayment: any = null;
  
  // Loan Payments Dialog
  showLoanPaymentsDialog = false;
  loanPayments: any[] = [];
  selectedLoan: any = null;
  paymentTypes = [
    { label: 'Pago Completo', value: 'full' },
    { label: 'Solo Capital', value: 'principal' },
    { label: 'Solo Interés', value: 'interest' }
  ];
  loading: boolean = false;

  // Participants
  participants: any[] = [];
  selectedParticipant: any = null;

  /**
   * Calculates the number of days until a given due date
   * @param dueDate The due date as a string or Date object
   * @returns A string indicating the days until due or if it's overdue
   */
  /**
   * Gets the initials from a participant's name
   * @param participantId The ID of the participant
   * @returns The initials of the participant's name
   */
  getParticipantInitials(participantId: number): string {
    const participant = this.participants.find(p => p.id === participantId);
    if (!participant) return '??';
    const names = participant.name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  /**
   * Generates a consistent random color based on a string or number
   * @param str The string or number to generate a color for
   * @returns A hex color code
   */
  getRandomColor(str: string | number): string {
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Amber
      '#6366F1', // Indigo
      '#EC4899', // Pink
      '#8B5CF6', // Violet
      '#14B8A6', // Teal
      '#F97316', // Orange
      '#EF4444', // Red
      '#06B6D4'  // Cyan
    ];
    
    // Simple hash function to get a consistent index from the string
    let hash = 0;
    const strValue = String(str);
    for (let i = 0; i < strValue.length; i++) {
      hash = strValue.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  /**
   * Gets the full name of a participant by ID
   * @param participantId The ID of the participant
   * @returns The participant's name or 'Desconocido' if not found
   */
  getParticipantName(participantId: number): string {
    const participant = this.participants.find(p => p.id === participantId);
    return participant ? participant.name : 'Desconocido';
  }

  /**
   * Calculates the number of days until a given due date
   * @param dueDate The due date as a string or Date object
   * @returns A string indicating the days until due or if it's overdue
   */
  getDaysUntilDue(dueDate: string | Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Vence hoy';
    if (diffDays < 0) return `Vencido hace ${Math.abs(diffDays)} días`;
    if (diffDays === 1) return 'Mañana';
    if (diffDays <= 7) return `En ${diffDays} días`;
    return `En ${Math.ceil(diffDays / 7)} semanas`;
  }
  
  /**
   * Gets the display text for a payment type
   * @param paymentType The payment type ('full', 'principal', or 'interest')
   * @returns The display text for the payment type
   */
  getPaymentTypeText(paymentType: string): string {
    switch (paymentType) {
      case 'full':
        return 'Pago Completo';
      case 'principal':
        return 'Capital';
      case 'interest':
        return 'Interés';
      default:
        return paymentType;
    }
  }

  /**
   * Gets the CSS class for the days until due indicator
   * @param dueDate The due date as a string or Date object
   * @returns A string representing the CSS class
   */
  getDaysUntilDueClass(dueDate: string | Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'danger';
    if (diffDays <= 3) return 'warning';
    return 'success';
  }

  // UI State
  loadingParticipants: boolean = false;
  
  isDark = false;

  constructor(
    private notificationService: NotificationService,
    private annualCyclesService: AnnualCyclesService,
    private loansService: LoansService,
    private authService: AuthService,
    private participanteService: ParticipanteService,
    // Replaced with notificationService
    private datePipe: DatePipe,
    public themeService: ThemeService,
    private loanPaymentService: Loanpaypamentservice,
    private cdr: ChangeDetectorRef
  ) {}
  
  /**
   * Opens the loan payments dialog and loads the payments for the selected loan
   * @param loan The loan to view payments for
   */
  viewLoanPayments(loan: any) {
    this.selectedLoan = loan;
    this.loanPayments = [];
    this.showLoanPaymentsDialog = true;
    
    this.loanPaymentService.getPaymentsByLoanId(loan.id).subscribe({
      next: (payments) => {
        this.loanPayments = payments;
      },
      error: (error) => {
        this.notificationService.error('No se pudieron cargar los pagos del préstamo');
      }
    });
  }

  /**
   * Opens the payment dialog for a specific loan
   * @param loan The loan to make a payment for
   */
  openPaymentDialog(loan: any) {
    
    this.selectedLoanForPayment = loan;
    
    // Initialize payment data
    this.paymentData = {
      loanId: loan.id,
      participantId: loan.participantId,
      amount: 0,
      paymentType: 'full',
      year: new Date().getFullYear(),
      weekNumber: 1
    };
    
    // Calculate initial payment amount
    this.calculatePaymentAmount('full');
    
    // Show the dialog
    this.showPaymentDialog = true;
    
    // Force change detection after a short delay to ensure UI updates
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }
  
  /**
   * Handles payment type change and updates the amount accordingly
   * @param paymentType The selected payment type
   */
  onPaymentTypeChange(paymentType: string) {
    
    // Update payment type and immediately calculate the amount
    this.paymentData.paymentType = paymentType;
    
    // Force update the amount
    this.calculatePaymentAmount(paymentType);
    
    // Force change detection
    this.cdr.detectChanges();
  }
  
  /**
   * Calculates the payment amount based on the payment type
   * @param paymentType The selected payment type
   */
  // Handle amount change (shouldn't be called directly by user since field is read-only)
  onAmountChange(newAmount: number) {
    // This is just a safety measure since the field is read-only
    this.paymentData.amount = newAmount;
  }

  private calculatePaymentAmount(paymentType: string) {
    if (!this.selectedLoanForPayment) {
      return;
    }
    
    const loan = this.selectedLoanForPayment;
    
    // Obtemos los valores del préstamo
    const monto = parseFloat(loan.amount) || 0;
    const interes = parseFloat(loan.totalInterest) || 0;
    
    // Calculamos el monto según el tipo de pago
    let montoCalculado = 0;
    switch (paymentType) {
      case 'full': // Pago completo: monto + interés
        montoCalculado = monto + interes;
        break;
      case 'principal': // Solo capital: monto
        montoCalculado = monto;
        break;
      case 'interest': // Solo interés
        montoCalculado = interes;
        break;
      default:
        montoCalculado = 0;
    }
    
    // Actualizamos el monto en paymentData
    this.paymentData = {
      ...this.paymentData,
      amount: montoCalculado
    };
    
    // Forzamos la detección de cambios
    this.cdr.detectChanges();
    
    // Log para depuración
    console.log('Monto de pago actualizado:', {
      tipo: paymentType,
      monto: montoCalculado,
      montoOriginal: monto,
      interes: interes
    });
  }

  onPaymentSubmit() {
    if (!this.paymentData.amount || this.paymentData.amount <= 0) {
      this.notificationService.error('El monto debe ser mayor a cero');
      return;
    }

    this.loading = true;
    this.loanPaymentService.createLoanPayment(this.paymentData as LoanPaymentRequest).subscribe({
      next: (response) => {
        this.notificationService.success('Pago registrado correctamente');
        this.showPaymentDialog = false;
        this.loadLoans(); // Reload loans to update the UI
      },
      error: (error) => {
        console.error('Error al registrar pago:', error);
        this.notificationService.error('Error al registrar el pago: ' + (error.error?.message || error.message || 'Error desconocido'));
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
  }

  // Participant Dialog Methods
  openParticipantDialog(participant: any = null) {
    this.selectedParticipant = participant ? { ...participant } : null;
    this.showParticipantDialog = true;
  }

  hideParticipantDialog() {
    this.showParticipantDialog = false;
  }

  saveParticipant(participant: any) {
    this.loading = true;
    // Here you would typically call a service to save the participant
    console.log('Saving participant:', participant);
    
    // Simulate API call
    this.loading = false;
    this.showParticipantDialog = false;
    this.notificationService.success('Participante guardado correctamente');
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadActiveCycle();
    this.loadAllCycles();
    this.loadLoans();
    this.loadActiveParticipants();
  }

  loadUserData(): void {
    // Load user data
  }

  loadData(): void {
    this.loadActiveCycle();
    this.loadAllCycles(); // Load all cycles for all users
    
    if (this.isAdmin) {
      this.loadActiveLoans();
    } else {
      this.loadMyLoans(); // Only load personal loans for non-admin users
    }
  }

  // Annual Cycles Methods
  private loadActiveCycle(): void {
    this.loading = true;
    this.annualCyclesService.getActiveCycle().subscribe({
      next: (cycle) => {
        this.activeCycle = cycle;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading active cycle:', err);
        this.notificationService.error('No se pudo cargar el ciclo activo');
        this.loading = false;
      }
    });
  }

  loadAllCycles(): void {
    this.loading = true;
    this.annualCyclesService.getAllCycles().subscribe({
      next: (cycles) => {
        this.allCycles = cycles;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading all cycles:', err);
        this.notificationService.error('No se pudieron cargar los ciclos anuales');
        this.loading = false;
      }
    });
  }

  activateNewCycle(): void {
    if (!this.newCycleYear) {
      this.notificationService.warning('Por favor ingrese un año válido');
      return;
    }

    this.loading = true;
    this.annualCyclesService.activateCycle(this.newCycleYear).subscribe({
      next: (cycle) => {
        this.activeCycle = cycle;
        this.loadAllCycles();
        this.showNewCycleDialog = false;
        this.notificationService.success(`Ciclo ${cycle.year} activado correctamente`);
      },
      error: (err) => {
        console.error('Error activating cycle:', err);
        this.notificationService.error(err.message || 'No se pudo activar el ciclo');
        this.loading = false;
      }
    });
  }

  closeCurrentCycle(): void {
    if (!this.activeCycle) return;

    this.loading = true;
    this.annualCyclesService.closeCycle(this.activeCycle.year).subscribe({
      next: (result) => {
        this.notificationService.success(result.message || 'Ciclo cerrado correctamente');
        this.loadActiveCycle();
        this.loadAllCycles();
      },
      error: (err) => {
        console.error('Error closing cycle:', err);
        this.notificationService.error(err.message || 'No se pudo cerrar el ciclo');
        this.loading = false;
      }
    });
  }

  // Loans Methods
  private loadMyLoans(): void {
    this.loading = true;
    this.loansService.getMyLoans().subscribe({
      next: (loans) => {
        this.myLoans = loans;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading my loans:', err);
        this.notificationService.error('No se pudieron cargar tus préstamos');
        this.loading = false;
      }
    });
  }

  private loadActiveLoans(): void {
    this.loading = true;
    this.loansService.getActiveLoans().subscribe({
      next: (loans) => {
        this.activeLoans = loans;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading active loans:', err);
        this.notificationService.error('No se pudieron cargar los préstamos activos');
        this.loading = false;
      }
    });
  }

  private loadCompletedLoans(): void {
    this.loading = true;
    this.loansService.getCompletedLoans().subscribe({
      next: (loans) => {
        this.completedLoans = loans;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading completed loans:', err);
        this.notificationService.error('No se pudieron cargar los préstamos completados');
        this.loading = false;
      }
    });
  }

  loadLoans(): void {
    if (this.isAdmin) {
      this.loadActiveLoans();
      this.loadCompletedLoans();
    } else {
      this.loadMyLoans();
    }
  }

  // Load active participants for dropdown
  loadActiveParticipants() {
    this.loadingParticipants = true;
    this.participanteService.getAllParticipants().subscribe({
      next: (participants: Participante[]) => {
        // Filter active participants and format for dropdown
        this.participants = participants
          .filter(p => p.isActive)
          .map(p => ({
            name: p.name,
            id: p.id,
            label: p.name,
            value: p.id
          }));
      },
      error: (error: any) => {
        console.error('Error loading participants:', error);
        this.notificationService.error('No se pudieron cargar los participantes activos');
      },
      complete: () => {
        this.loadingParticipants = false;
      }
    });
  }

  createNewLoan() {
    if (!this.selectedParticipant || !this.newLoan.amount || !this.activeCycle?.year) {
      this.notificationService.warning('Por favor complete todos los campos obligatorios');
      return;
    }

    this.loading = true;
    const loanData = {
      participantId: this.selectedParticipant.id,
      amount: this.newLoan.amount,
      year: this.activeCycle.year
    };

    this.loansService.createLoan(loanData).subscribe({
      next: (response) => {
        this.notificationService.success('Préstamo creado correctamente');
        this.showNewLoanDialog = false;
        this.resetNewLoanForm();
        this.loadLoans();
      },
      error: (error) => {
        console.error('Error creating loan:', error);
        this.notificationService.error('Error al crear el préstamo: ' + (error.error?.message || error.message || 'Error desconocido'));
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private resetNewLoanForm() {
    this.newLoan = {
      participantId: 0,
      amount: 0,
      year: this.activeCycle?.year || new Date().getFullYear()
    };
    this.selectedParticipant = null;
  }

  // Formatting helpers
  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'N/A';
    return this.datePipe.transform(date, 'mediumDate') || 'N/A';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  getLoanStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Activo',
      'deferred': 'Diferido',
      'defaulted': 'Vencido',
      'paid': 'Pagado'
    };
    return statusMap[status] || status;
  }
}
