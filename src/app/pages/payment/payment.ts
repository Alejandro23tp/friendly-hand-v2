import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  PaymentService, 
  PaymentDto as ServicePaymentDto, 
  CreatePaymentDto as ServiceCreatePaymentDto, 
  CreateWeeklyPaymentsDto as ServiceCreateWeeklyPaymentsDto 
} from '../../services/payment/paymentservice';
import { AnnualCyclesService } from '../../services/anualcycles/anualcyclesservice';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '../../services/notification.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { AuthService } from '../../services/auth/authservice';
import { ProgressSpinner } from "primeng/progressspinner";
import { ParticipanteService } from '../../services/participantes/participanteservice';

// Local DTO interfaces that extend service DTOs
export interface PaymentDto extends ServicePaymentDto {
  participantName: string;
  paymentDate: string;
  cycleYear: number;
  createdAt: string;
}

export interface CreatePaymentDto {
  participantId: number;
  weekNumber: number;
  year: number;
}

export interface CreateWeeklyPaymentsDto extends ServiceCreateWeeklyPaymentsDto {
  year: number;
  weekNumber: number;
  excludeParticipantIds: number[];
}

interface YearOption {
  label: string;
  value: number;
}

interface ParticipantOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    InputNumberModule,
    InputTextModule,
    TabsModule,
    TagModule,
    ConfirmDialogModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule,
    ProgressSpinner
],
  providers: [
    ConfirmationService,
    PaymentService,
    AuthService,
    ParticipanteService,
    AnnualCyclesService,
    NotificationService
  ],
  templateUrl: './payment.html',
  styleUrls: ['./payment.scss']
})
export class PaymentComponent implements OnInit {
  // User payments
  myPayments: PaymentDto[] = [];
  loadingPayments = false;
  
  // Participants list for dropdown
  participantOptions: { label: string, value: string }[] = [];
  loadingParticipants = false;
  
  // New payment form
  newPayment: CreatePaymentDto = {
    participantId: 0,
    weekNumber: this.getCurrentWeekNumber(),
    year: new Date().getFullYear()
  };
  
  // Selected year for new payment form
  selectedNewPaymentYear: YearOption = { label: new Date().getFullYear().toString(), value: new Date().getFullYear() };
  
  // Weekly payments
  weeklyPayments: CreateWeeklyPaymentsDto = {
    year: new Date().getFullYear(),
    weekNumber: this.getCurrentWeekNumber(),
    excludeParticipantIds: []
  };
  
  // Selected year for weekly payments
  selectedWeeklyPaymentsYear: YearOption = { label: new Date().getFullYear().toString(), value: new Date().getFullYear() };
  
  // Available years for selection
  years: YearOption[] = [];
  
  // Get years for dropdown with optional callback
  private getYears(callback?: (years: YearOption[]) => void): void {
    this.loading = true;
    this.annualCyclesService.getAllCycles().subscribe({
      next: (cycles) => {
        // Map cycles to the format expected by the dropdown
        this.years = cycles.map(cycle => ({
          label: cycle.year.toString(),
          value: cycle.year
        }));
        
        // Sort years in descending order (newest first)
        this.years.sort((a, b) => b.value - a.value);
        
        
        // Execute callback if provided
        if (callback) {
          callback(this.years);
        }
      },
      error: (error) => {
        console.error('Error loading annual cycles:', error);
        // Fallback to current year if API fails
        const currentYear = new Date().getFullYear();
        this.years = [
          { label: (currentYear - 1).toString(), value: currentYear - 1 },
          { label: currentYear.toString(), value: currentYear },
          { label: (currentYear + 1).toString(), value: currentYear + 1 }
        ];
        
        // Execute callback if provided
        if (callback) {
          callback(this.years);
        }
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  
  // Selected year for cycle payments
  selectedYear: YearOption = { label: new Date().getFullYear().toString(), value: new Date().getFullYear() };
  
  // Cycle payments
  cyclePayments: PaymentDto[] = [];
  loadingCyclePayments = false;
  
  // UI state
  activeTab: 'myPayments' | 'createPayment' | 'cyclePayments' | 'weeklyPayments' = 'myPayments';
  isAdmin = false;
  loading = false;
  
  // Track which tabs have been loaded
  private loadedTabs = {
    myPayments: false,
    createPayment: true, // No initial load needed for createPayment tab
    cyclePayments: false,
    weeklyPayments: true // No initial load needed for weeklyPayments tab
  };

  // Services
  constructor(
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private participanteService: ParticipanteService,
    private annualCyclesService: AnnualCyclesService
  ) { }
  
  ngOnInit(): void {
    this.checkAdminStatus();
    
    // Set initial active tab based on admin status
    this.activeTab = this.isAdmin ? 'cyclePayments' : 'myPayments';
    
    // Load initial data based on user role
    if (this.isAdmin) {
      this.loadCyclePayments();
      this.loadParticipants();
      this.loadAnnualCycles(); // Only load cycles for admin
      this.loadedTabs.cyclePayments = true;
    } else {
      this.loadMyPayments();
      this.loadedTabs.myPayments = true;
    }
  }

  loadAnnualCycles(): void {
    this.getYears((years) => {
      const currentYear = new Date().getFullYear();
      const defaultYear = years.find(y => y.value === currentYear) || years[0];
      
      // Set default years for all tabs if not already set
      if (!this.selectedYear) this.selectedYear = defaultYear;
      if (!this.selectedNewPaymentYear) this.selectedNewPaymentYear = defaultYear;
      if (!this.selectedWeeklyPaymentsYear) this.selectedWeeklyPaymentsYear = defaultYear;
      
      // Update form values with selected years
      if (this.newPayment) this.newPayment.year = this.selectedNewPaymentYear.value;
      if (this.weeklyPayments) this.weeklyPayments.year = this.selectedWeeklyPaymentsYear.value;
      
      // Load cycle payments for the admin tab
      this.loadCyclePayments();
    });
  }
  
  // Handle year change in new payment form
  onNewPaymentYearChange(): void {
    if (this.selectedNewPaymentYear) {
      this.newPayment.year = this.selectedNewPaymentYear.value;
    }
  }
  
  // Handle year change in weekly payments form
  onWeeklyPaymentsYearChange(): void {
    if (this.selectedWeeklyPaymentsYear) {
      this.weeklyPayments.year = this.selectedWeeklyPaymentsYear.value;
    }
  }
  
  loadMyPayments() {
    this.loadingPayments = true;
    console.log(this.loadingPayments, "Init");
    this.paymentService.getMyPayments().subscribe(
      (payments) => {
        this.myPayments = payments.map(payment => ({
          ...payment,
          participantName: payment.participant?.name || 'Unknown',
          paymentDate: new Date().toISOString(),
          cycleYear: payment.year,
          createdAt: new Date().toISOString()
        } as PaymentDto));
        this.loadingPayments = false;
        console.log(this.myPayments);
      },
      (error) => {
        console.error('Error loading payments:', error);
        this.notificationService.error('No se pudieron cargar los pagos. Por favor, intente nuevamente.');
        this.loadingPayments = false;
      }
    );
  }
  
  loadCyclePayments() {
    if (!this.selectedYear || !this.selectedYear.value) {
      console.warn('No year selected');
      return;
    }
    
    this.loadingCyclePayments = true;
    
    this.paymentService.getCyclePayments(this.selectedYear.value).subscribe({
      next: (payments) => {
        this.cyclePayments = payments.map(payment => ({
          ...payment,
          participantName: payment.participant?.name || 'Unknown',
          paymentDate: payment.paymentDate,
          cycleYear: payment.year,
          createdAt: payment.createdAt
        } as PaymentDto));
      },
      error: (error) => {
        console.error('Error loading cycle payments:', error);
        this.notificationService.error('No se pudieron cargar los pagos del ciclo');
      },
      complete: () => {
        this.loadingCyclePayments = false;
      }
    });
  }
  
  loadParticipants(): void {
    this.loadingParticipants = true;
    this.participanteService.getAllParticipants().subscribe({
      next: (participants) => {
        this.participantOptions = participants.map(p => ({
          label: p.name,
          value: p.id.toString() // Convert to string to match Dropdown value type
        }));
        this.loadingParticipants = false;
      },
      error: (error) => {
        console.error('Error loading participants:', error);
        this.notificationService.error('No se pudieron cargar los participantes');
        this.loadingParticipants = false;
      }
    });
  }

  checkAdminStatus() {
    try {
      this.isAdmin = this.authService.isAdmin;
      
      // Update active tab based on admin status
      if (this.activeTab === 'myPayments' && this.isAdmin) {
        this.activeTab = 'cyclePayments';
      } else if (this.activeTab !== 'myPayments' && !this.isAdmin) {
        this.activeTab = 'myPayments';
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      this.isAdmin = false;
      this.activeTab = 'myPayments';
    }
  }

  createPayment(): void {
    console.log('createPayment called with:', this.newPayment);
    console.log('Selected year:', this.selectedNewPaymentYear);
    
    // Validate required fields
    if (!this.newPayment.participantId) {
      console.log('Validation failed - missing participant');
      this.notificationService.warning('Por favor seleccione un participante');
      return;
    }
    
    if (!this.newPayment.weekNumber) {
      console.log('Validation failed - missing week number');
      this.notificationService.warning('Por favor ingrese el número de semana');
      return;
    }
    
    if (!this.selectedNewPaymentYear) {
      console.log('Validation failed - missing year');
      this.notificationService.warning('Por favor seleccione un año');
      return;
    }
    
    // Extract participant ID whether it's an object or a primitive
    interface ParticipantOption {
      value: string | number;
      label: string;
    }
    
    const participant = this.newPayment.participantId as ParticipantOption | number | string;
    const participantId = typeof participant === 'object' ? 
                         Number(participant.value) : 
                         Number(participant);
    
    const weekNumber = Number(this.newPayment.weekNumber);
    const year = this.selectedNewPaymentYear && 
                typeof this.selectedNewPaymentYear === 'object' ?
                Number(this.selectedNewPaymentYear.value) :
                Number(this.selectedNewPaymentYear);
  
    if (isNaN(participantId) || isNaN(weekNumber) || isNaN(year)) {
      console.error('Invalid values:', { participantId, weekNumber, year });
      this.notificationService.error('Los valores ingresados no son válidos');
      return;
    }

    const paymentData = {
      weekNumber: weekNumber,
      year: year
    };
  
    console.log('Sending payment data:', { participantId, paymentData });
    
    this.loading = true;
    
    this.paymentService.createPayment(participantId, paymentData).subscribe({
      next: (payment) => {
        this.notificationService.success('Pago registrado correctamente');
        
        // Only reload the cycle payments if we're an admin
        if (this.isAdmin) {
          this.loadCyclePayments();
        } else {
          // For non-admin users, refresh their payments
          this.loadedTabs.myPayments = false; // Force reload on next view
        }
        
        // Reset the form
        this.newPayment = {
          participantId: 0,
          weekNumber: this.getCurrentWeekNumber(),
          year: new Date().getFullYear()
        };
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creating payment:', error);
        this.notificationService.error(error.error?.message || 'Error al registrar el pago');
        this.loading = false;
      }
    });
  }
  
  bulkPayAllParticipants() {
    if (!this.weeklyPayments.year) {
      this.notificationService.error('Por favor seleccione un año');
      return;
    }

    this.loading = true;
    
    this.paymentService.bulkPayAllParticipants(
      this.weeklyPayments.year,
      this.weeklyPayments.weekNumber,
      this.weeklyPayments.excludeParticipantIds || []
    ).subscribe({
      next: (result) => {
        // Show detailed success message
        const successMessage = `Pagos procesados para la semana ${result.weekNumber} del año ${result.year}. ` +
                             `Total participantes: ${result.totalParticipants}, ` +
                             `Pagos creados: ${result.paymentsCreated}, ` +
                             `Pagos omitidos: ${result.paymentsSkipped}`;
        
        this.notificationService.success(successMessage);
        
        // Reset the form
        this.weeklyPayments = {
          year: new Date().getFullYear(),
          weekNumber: this.getCurrentWeekNumber(),
          excludeParticipantIds: []
        };
        
        this.loading = false;
        
        // Reload cycle payments to show the new ones
        this.loadCyclePayments();
      },
      error: (error) => {
        console.error('Error procesando pagos masivos:', error);
        this.notificationService.error(error.error?.message || 'Error al procesar los pagos masivos');
        this.loading = false;
      }
    });
  }
  
  private getCurrentWeekNumber(): number {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const dayOfWeek = startOfYear.getDay() || 7;
    return Math.ceil((pastDaysOfYear + dayOfWeek) / 7);
  }
  
  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Fecha inválida';
    }
  }

  // Get status severity for tags
  getStatusSeverity(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'pagado':
        return 'success';
      case 'pending':
      case 'pendiente':
        return 'warning';
      case 'failed':
      case 'fallido':
        return 'danger';
      default:
        return 'info';
    }
  }
  
  // Change active tab
  setActiveTab(tab: 'myPayments' | 'createPayment' | 'cyclePayments' | 'weeklyPayments') {
    // Only allow switching to allowed tabs
    if ((tab === 'myPayments' && !this.isAdmin) || 
        (tab !== 'myPayments' && this.isAdmin)) {
      this.activeTab = tab;
      
      // Load data for the tab if not already loaded
      if (tab === 'cyclePayments' && !this.loadedTabs.cyclePayments) {
        this.loadCyclePayments();
        this.loadedTabs.cyclePayments = true;
      } else if (tab === 'myPayments' && !this.loadedTabs.myPayments) {
        this.loadMyPayments();
        this.loadedTabs.myPayments = true;
      }
    }
  }
}
