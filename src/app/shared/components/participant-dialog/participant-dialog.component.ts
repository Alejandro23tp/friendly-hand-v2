import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

import { TooltipModule } from 'primeng/tooltip';

import { Participante } from '../../../models/participante.model';
import { NotificationService } from '../../../services/notification.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-participant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // PrimeNG
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,

    TooltipModule
  ],
  templateUrl: './participant-dialog.component.html',
  styleUrl: './participant-dialog.component.scss'
})
export class ParticipantDialogComponent implements OnChanges {
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  
  @Input() visible: boolean = false;
  @Input() editMode: boolean = false;
  @Input() isAdmin: boolean = false;
  @Input() loading: boolean = false;
  @Input() defaultPassword: string = 'FriendlyHand2024!';
  @Input() participant: Partial<Participante> | null = null;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Partial<Participante>>();
  @Output() onHide = new EventEmitter<void>();
  
  submitted = false;
  showPassword = false;
  formData: Partial<Participante> = {
    password: this.defaultPassword,
    isActive: true,
    isNew: false,
    role: 'user',
    name: '',
    email: '',
    phone: '',
    shares: 0
  };
  
  private _participant: Partial<Participante> | null = null;
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['participant'] && this.participant) {
      this.formData = { 
        ...this.participant,
        // No mostramos la contraseña en edición por seguridad
        password: this.participant.password || this.defaultPassword,
        name: this.participant.name || '',
        email: this.participant.email || '',
        phone: this.participant.phone || '',
        shares: this.participant.shares || 0,
        isActive: this.participant.isActive ?? true,
        isNew: this.participant.isNew ?? false
      };
    } else if (changes['visible'] && this.visible) {
      // Reset form when dialog is opened
      this.resetForm();
    }
  }
  
  get themeService(): ThemeService {
    return inject(ThemeService);
  }
  
  onHideDialog() {
    this.visibleChange.emit(false);
    this.onHide.emit();
    this.resetForm();
  }
  
  save() {
    this.submitted = true;
    
    // Validar campos requeridos
    if (!this.formData.name?.trim() || !this.formData.email?.trim() || (!this.editMode && !this.formData.password?.trim())) {
      return;
    }
    
    // Crear un objeto con solo los campos necesarios
    const participantData: Partial<Participante> = {
      name: this.formData.name?.trim() || '',
      email: this.formData.email?.trim() || '',
      phone: this.formData.phone?.trim() || undefined, // Incluir el teléfono si existe
      password: this.editMode ? undefined : (this.formData.password || this.defaultPassword),
      role: 'participant',
      shares: typeof this.formData.shares === 'number' ? this.formData.shares : 0,
      isActive: this.formData.isActive ?? true,
      isNew: this.formData.isNew ?? false
    };
    
    // No actualizamos la contraseña si estamos en modo edición y no se ha cambiado
    if (this.editMode && !this.formData.password) {
      delete participantData.password;
    }
    
    if (this.editMode && this._participant?.id) {
      participantData.id = this._participant.id;
    }
    
    // Emitir el evento con los datos del formulario
    this.onSave.emit(participantData);
  }
  
  updatePassword(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.password = input.value;
  }
  
  private resetForm() {
    this.formData = {
      password: this.defaultPassword,
      isActive: true,
      isNew: false,
      role: 'participant',
      name: '',
      email: '',
      shares: 0
    };
    this.submitted = false;
    this.showPassword = false;
  }
  
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.notificationService.success('Contraseña copiada al portapapeles');
    }).catch(err => {
      console.error('Error al copiar al portapeles:', err);
      this.notificationService.error('No se pudo copiar la contraseña');
    });
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  onToggleChange() {
    // Forzar la detección de cambios
    this.cdr.detectChanges();
  }
}
