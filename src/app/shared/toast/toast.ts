import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="toast"
      *ngIf="visible"
      [class.success]="tipo === 'success'"
      [class.error]="tipo === 'error'"
      [class.warn]="tipo === 'warn'"
    >
      <span class="toast-icon">{{ getIcono() }}</span>
      <span class="toast-msg">{{ mensaje }}</span>
    </div>
  `,
  styles: [
    `
      .toast {
        position: fixed;
        bottom: 32px;
        right: 32px;
        padding: 14px 24px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 13px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
      }
      .success {
        background: #0d2a1a;
        border: 1px solid #166534;
        color: #22c55e;
      }
      .error {
        background: #450a0a;
        border: 1px solid #7f1d1d;
        color: #f87171;
      }
      .warn {
        background: #451a03;
        border: 1px solid #92400e;
        color: #fcd34d;
      }
      .toast-icon {
        font-size: 16px;
      }
      .toast-msg {
        letter-spacing: 0.5px;
      }
      @keyframes slideIn {
        from {
          transform: translateX(100px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ToastComponent implements OnInit {
  @Input() mensaje = '';
  @Input() tipo: 'success' | 'error' | 'warn' = 'success';
  @Input() duracion = 3000;

  visible = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    setTimeout(() => {
      this.visible = true;
      this.cdr.detectChanges();
    });
    setTimeout(() => {
      this.visible = false;
      this.cdr.detectChanges();
    }, this.duracion);
  }

  getIcono(): string {
    if (this.tipo === 'success') return '✓';
    if (this.tipo === 'error') return '✗';
    return '⚠';
  }
}
