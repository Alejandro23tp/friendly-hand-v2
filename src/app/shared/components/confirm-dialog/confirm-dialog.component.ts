import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [modal]="true" 
      [style]="{ width: '450px' }" 
      [draggable]="false"
      (onHide)="onHide.emit()"
      [resizable]="false">
      <ng-template pTemplate="header">
        <div class="flex align-items-center">
          <i class="pi pi-exclamation-triangle mr-3" style="font-size: 1.5rem"></i>
          <span class="text-xl font-semibold">Confirmar</span>
        </div>
      </ng-template>
      
      <div class="p-4 text-center">
        <p class="text-lg mb-4" [innerHTML]="message"></p>
      </div>
      
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2">
          <button 
            pButton pRipple 
            label="Cancelar" 
            class="p-button-text" 
            (click)="onHide.emit()"
            [disabled]="loading"></button>
          <button 
            pButton pRipple 
            [label]="loading ? 'Procesando...' : 'Confirmar'" 
            class="p-button-primary" 
            (click)="onConfirm.emit()"
            [loading]="loading"></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() visible: boolean = false;
  @Input() message: string = '';
  @Input() loading: boolean = false;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onHide = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<void>();

  constructor() {}
}
