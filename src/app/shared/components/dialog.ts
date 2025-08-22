import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss'
})
export class DialogComponent {
  @Input() header: string = '';
  @Input() visible: boolean = false;
  @Input() modal: boolean = true;
  @Input() style: { [key: string]: string } = { 'min-width': '450px' };
  @Input() closeOnEscape: boolean = true;
  @Input() dismissableMask: boolean = true;
  @Input() showHeader: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() acceptLabel: string = 'Aceptar';
  @Input() cancelLabel: string = 'Cancelar';
  @Input() showAccept: boolean = true;
  @Input() showCancel: boolean = true;
  @Input() loading: boolean = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onAccept = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  onDialogHide() {
    this.visibleChange.emit(false);
  }

  accept() {
    this.onAccept.emit();
  }

  cancel() {
    this.onCancel.emit();
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
