import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

// Services
import { NotificationService } from '../../services/notification.service';

// Components
import { ParticipantDialogComponent } from '../../shared/components/participant-dialog/participant-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

import { Participante, UpdateParticipantStatusDto } from '../../models/participante.model';
import { ParticipanteService } from '../../services/participantes/participanteservice';
import { AuthService } from '../../services/auth/authservice';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // PrimeNG
    ButtonModule,
    TableModule,
    ConfirmDialogModule,
    TooltipModule,
    ProgressSpinnerModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    // Components
    ConfirmDialogComponent,
    ParticipantDialogComponent
  ],
  templateUrl: './participantes.html',
  styleUrl: './participantes.scss',
  providers: [ConfirmationService]
})
export class Participantes implements OnInit {

  stats = [
    { label: 'Followers', value: 333 },
    { label: 'Projects', value: 26 },
    { label: 'Collections', value: 17 },
    { label: 'Shots', value: 130 },
  ];
  
  private participanteService = inject(ParticipanteService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private notificationService = inject(NotificationService);

  participantes: Participante[] = [];
  selectedParticipante: Partial<Participante> = {
    id: '',
    name: '',
    email: '',
    password: 'FriendlyHand2024!',
    role: 'participant',
    shares: 0,
    isActive: true,
    isNew: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  displayDialog: boolean = false;
  editMode: boolean = false;
  loading: boolean = false;
  isAdmin: boolean = false;
  defaultPassword: string = 'FriendlyHand2024!';
  showConfirmDialog: boolean = false;
  confirmMessage: string = '';
  submitted: boolean = false;
  showPassword: boolean = false;
  private confirmActionCallback: (() => void) | null = null;
  
  // Nombres para la detección de género
  private maleNames = ['Alejandro', 'Carlos', 'Juan', 'Luis'];
  private femaleNames = ['María', 'Ana', 'Lucía', 'Sofía'];
  
  // Control de pestañas
  activeTab: 'active' | 'inactive' = 'active';
  
  // Se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.checkAdminStatus();
    this.loadParticipants();
  }

  private checkAdminStatus(): void {
    const user = this.authService.currentUserValue;
    this.isAdmin = user?.role === 'admin';
  }

  // Actualiza el estado de un participante
  updateParticipantStatus(participant: Participante, newStatus: boolean): void {
    const updateData = { isActive: newStatus };
    this.participanteService.updateParticipantStatus(participant.id, updateData).subscribe({
      next: () => {
        participant.isActive = newStatus;
        this.notificationService.success(`Estado actualizado correctamente`);
        this.loadParticipants(); // Recargar la lista para asegurar consistencia
      },
      error: (error: any) => {
        console.error('Error al actualizar estado:', error);
        this.notificationService.error('No se pudo actualizar el estado');
      }
    });
  }
  
  // Maneja el cambio de pestaña
  onTabChange(): void {
    this.loadParticipants();
  }
  
  // Carga los participantes según la pestaña activa
  loadParticipants(): void {
    this.loading = true;
    const participants$ = this.activeTab === 'active' 
      ? this.participanteService.getAllParticipants()
      : this.participanteService.getInactiveParticipants();

    participants$.subscribe({
      next: (participants: Participante[]) => {
        this.participantes = participants;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar participantes:', error);
        this.notificationService.error('No se pudieron cargar los participantes');
        this.loading = false;
      }
    });
  }
  
  // Obtiene la ruta de la imagen según el género
  getGenderImage(name: string): string {
    if (!name) return 'male.png';
    const firstName = name.split(' ')[0];
    if (this.maleNames.includes(firstName)) return 'male.png';
    if (this.femaleNames.includes(firstName)) return 'female.png';
    return 'male.png';
  }

  openNew() {
    this.selectedParticipante = {
      id: '',
      name: '',
      email: '',
      password: this.defaultPassword,
      role: 'participant',
      shares: 0,
      isActive: true,
      isNew: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.editMode = false;
    this.submitted = false;
    this.displayDialog = true;
  }

  editParticipante(participante: Participante) {
    this.selectedParticipante = { ...participante };
    this.editMode = true;
    this.submitted = false;
    this.displayDialog = true;
  }

  onHideDialog() {
    this.displayDialog = false;
    this.selectedParticipante = {
      id: '',
      name: '',
      email: '',
      password: this.defaultPassword,
      role: 'participant',
      shares: 0,
      isActive: true,
      isNew: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.submitted = false;
  }
  
  // Métodos para el diálogo de confirmación
  showConfirm(message: string, callback: () => void) {
    this.confirmMessage = message;
    this.confirmActionCallback = callback;
    this.showConfirmDialog = true;
  }
  
  onConfirmDialogHide() {
    this.showConfirmDialog = false;
    this.confirmActionCallback = null;
  }
  
  confirmAction() {
    if (this.confirmActionCallback) {
      this.loading = true;
      try {
        this.confirmActionCallback();
      } finally {
        this.loading = false;
        this.showConfirmDialog = false;
        this.confirmActionCallback = null;
      }
    }
  }

  toggleStatus(participante: Participante) {
    const newStatus = !participante.isActive;
    const statusText = newStatus ? 'activar' : 'desactivar';
    const actionText = newStatus ? 'activación' : 'desactivación';
    
    this.showConfirm(
      `¿Deseas ${statusText} al usuario <strong>${participante.name}</strong>?`,
      () => {
        const updateData: UpdateParticipantStatusDto = { isActive: newStatus };
        this.loading = true;
        this.participanteService.updateParticipantStatus(participante.id, updateData).subscribe({
          next: () => {
            this.notificationService.success(`Usuario ${statusText}do correctamente`);
            // Recargar la lista actual para reflejar los cambios
            this.loadParticipants();
          },
          error: (error: any) => {
            console.error(`Error al ${statusText} usuario:`, error);
            this.notificationService.error(`No se pudo completar la ${actionText} del usuario`);
            this.loading = false;
          }
        });
      }
    );
  }

  deleteParticipante(participante: Participante) {
    this.showConfirm(
      `¿Estás seguro de eliminar a <strong>${participante.name}</strong>? Esta acción no se puede deshacer.`,
      () => {
        this.participanteService.deleteParticipant(participante.id!).subscribe({
          next: () => {
            this.notificationService.success('Participante eliminado correctamente');
            this.loadParticipants();
          },
          error: (error: any) => {
            console.error('Error al eliminar participante:', error);
            this.notificationService.error('No se pudo eliminar el participante');
            this.loading = false;
          }
        });
      }
    );
  }

  private showSuccess(message: string) {
    this.notificationService.success(message);
  }

  private showError(message: string) {
    this.notificationService.error(message);
  }

  // Handle dialog visibility changes
  onDialogVisibilityChange(visible: boolean) {
    this.displayDialog = visible;
    if (!visible) {
      this.onHideDialog();
    }
  }

  // Getter for the participant dialog component
  get selectedParticipant() {
    return this.selectedParticipante;
  }
  
  // Handle save from dialog
  handleSave(participantData: Partial<Participante>) {
    this.loading = true;
    
    if (this.editMode && this.selectedParticipante?.id) {
      // Update existing participant
      const updateData = {
        name: participantData.name,
        email: participantData.email,
        phone: participantData.phone || undefined, // Incluir el teléfono en la actualización
        shares: participantData.shares,
        isActive: participantData.isActive,
        isNew: participantData.isNew
      };
      
      this.participanteService.updateParticipant(this.selectedParticipante.id, updateData).subscribe({
        next: (updatedParticipant) => {
          const index = this.participantes.findIndex(p => p.id === updatedParticipant.id);
          if (index !== -1) {
            this.participantes[index] = updatedParticipant;
          }
          this.notificationService.success('Participante actualizado correctamente');
          this.displayDialog = false;
          this.loading = false;
          this.loadParticipants();
        },
        error: (error) => {
          console.error('Error al actualizar participante:', error);
          this.notificationService.error('No se pudo actualizar el participante');
          this.loading = false;
        }
      });
    } else {
      // Create new participant
      const newParticipant = {
        name: participantData.name || '',
        email: participantData.email || '',
        phone: participantData.phone || undefined,
        password: participantData.password || this.defaultPassword,
        role: 'participant',
        shares: typeof participantData.shares === 'number' ? participantData.shares : 0,
        isActive: participantData.isActive ?? true,
        isNew: participantData.isNew ?? false
      };
      
      this.participanteService.createParticipant(newParticipant).subscribe({
        next: (createdParticipant) => {
          this.participantes = [...this.participantes, createdParticipant];
          this.notificationService.success('Participante creado correctamente');
          this.displayDialog = false;
          this.loading = false;
          this.loadParticipants();
        },
        error: (error) => {
          console.error('Error al crear participante:', error);
          this.notificationService.error('No se pudo crear el participante. Verifica que el correo no esté en uso.');
          this.loading = false;
        }
      });
    }
  }

  // Handle toggle switch changes for isNew
  onToggleIsNew(isNew: boolean) {
    if (this.selectedParticipante) {
      console.log('Toggling isNew to:', isNew);
      this.selectedParticipante.isNew = isNew;
    }
  }

  // Getter/Setter for isNew to handle the toggle switch
  get isNewParticipant(): boolean {
    return this.selectedParticipante.isNew ?? false;
  }
  
  set isNewParticipant(value: boolean) {
    if (this.selectedParticipante) {
      this.selectedParticipante.isNew = value;
    }
  }

  getStatusSeverity(status: boolean) {
    return status ? 'success' : 'danger';
  }

  getStatusText(status: boolean) {
    return status ? 'Activo' : 'Inactivo';
  }

  /**
   * Copia el texto al portapapeles
   */
  copyToClipboard(text: string | undefined) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.notificationService.success('Copiado al portapapeles');
    }).catch(err => {
      console.error('Error al copiar al portapeles:', err);
      this.notificationService.error('No se pudo copiar la contraseña');
    });
  }

  // Validar formato de email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Guardar participante
  saveParticipant() {
    this.submitted = true;
    
    // Validar campos requeridos
    if (!this.selectedParticipante.name?.trim() || 
        !this.selectedParticipante.email?.trim() || 
        (!this.editMode && !this.selectedParticipante.password?.trim())) {
      return;
    }

    // Validar formato de email
    if (this.selectedParticipante.email && !this.isValidEmail(this.selectedParticipante.email)) {
      return;
    }

    // Llamar al método handleSave con los datos del participante
    this.handleSave({
      ...this.selectedParticipante,
      // Usar el valor actual de isNew, con false como valor por defecto
      isNew: this.selectedParticipante.isNew ?? false,
      // Asegurarse de que los demás campos tengan valores por defecto
      role: 'participant',
      shares: this.selectedParticipante.shares ?? 0,
      isActive: this.selectedParticipante.isActive ?? true
    });
  }

  get themeService(): ThemeService {
    return inject(ThemeService);
  }
}
