import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProyectoService } from '../../services/proyecto';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Configuración</h1>
      <p class="page-sub">PARÁMETROS DEL SISTEMA</p>
    </div>

    <!-- CONFIGURACIONES -->
    <div class="card">
      <h3 class="card-title">Configuración General del Sistema</h3>

      <div *ngFor="let item of config" class="config-row">
        <div
          style="margin-bottom:6px;display:flex;justify-content:space-between;align-items:center"
        >
          <label class="label">{{ item.clave }}</label>
          <span class="tipo-badge">{{ item.tipo }}</span>
        </div>
        <p style="font-size:12px;color:#5a5650;margin-bottom:8px">{{ item.descripcion }}</p>

        <select *ngIf="item.tipo === 'BOOLEAN'" class="input" [(ngModel)]="item.valor">
          <option value="true">Activado</option>
          <option value="false">Desactivado</option>
        </select>

        <input
          *ngIf="item.tipo !== 'BOOLEAN'"
          class="input"
          [(ngModel)]="item.valor"
          [type]="item.tipo === 'NUMBER' ? 'number' : item.tipo === 'EMAIL' ? 'email' : 'text'"
        />
      </div>

      <div style="display:flex;gap:12px;align-items:center;margin-top:8px">
        <button class="btn btn-primary" (click)="guardar()">Guardar Configuración</button>
        <span *ngIf="guardado" class="guardado-msg">✓ Guardado correctamente</span>
      </div>
    </div>

    <!-- ALERTAS MANUALES -->
    <div class="card" style="margin-top:24px">
      <h3 class="card-title">Alertas Manuales</h3>
      <p style="font-size:13px;color:#7a7669;margin-bottom:16px;line-height:1.7">
        Ejecutá el proceso de verificación de alertas manualmente, sin esperar al job programado del
        backend.
      </p>
      <div style="display:flex;gap:12px;align-items:center">
        <button class="btn" (click)="ejecutarAlertas()" [disabled]="ejecutando">
          {{ ejecutando ? '⏳ Ejecutando...' : '▶ Ejecutar Verificación de Alertas' }}
        </button>
        <span *ngIf="resultadoAlertas" class="guardado-msg">
          ✓ {{ resultadoAlertas.alertasEnviadas }} alerta(s) enviada(s) de
          {{ resultadoAlertas.proyectosEvaluados }} proyecto(s)
        </span>
      </div>
    </div>

    <!-- INFO DEL SISTEMA -->
    <div class="card" style="margin-top:24px">
      <h3 class="card-title">Información del Sistema</h3>
      <div class="info-row">
        <span class="label">Backend</span><span>Spring Boot 3 · Java 17 · Puerto 8080</span>
      </div>
      <div class="info-row">
        <span class="label">Frontend</span><span>Angular {{ angularVersion }} · Puerto 4200</span>
      </div>
      <div class="info-row">
        <span class="label">Base de datos</span
        ><span>H2 (desarrollo) · PostgreSQL (producción)</span>
      </div>
      <div class="info-row">
        <span class="label">Job automático</span><span>Lunes a viernes 8:00 AM</span>
      </div>
    </div>
  `,
  styles: [
    `
      .page-title {
        font-size: 28px;
        font-weight: 300;
        color: #e8e0d4;
      }
      .page-sub {
        font-size: 12px;
        color: #5a5650;
        font-family: 'IBM Plex Mono', monospace;
        margin-bottom: 32px;
        margin-top: 4px;
      }
      .card {
        background: #111318;
        border: 1px solid #1e2130;
        border-radius: 2px;
        padding: 24px;
      }
      .card-title {
        font-size: 13px;
        letter-spacing: 2px;
        color: #d4a853;
        text-transform: uppercase;
        font-family: 'IBM Plex Mono', monospace;
        margin-bottom: 24px;
      }
      .config-row {
        padding-bottom: 20px;
        margin-bottom: 20px;
        border-bottom: 1px solid #1a1c22;
      }
      .label {
        font-size: 11px;
        letter-spacing: 1.5px;
        color: #5a5650;
        text-transform: uppercase;
        font-family: 'IBM Plex Mono', monospace;
        display: block;
        margin-bottom: 0;
      }
      .input {
        background: #0c0e14;
        border: 1px solid #1e2130;
        border-radius: 2px;
        padding: 8px 12px;
        color: #e8e0d4;
        font-size: 14px;
        font-family: 'Crimson Pro', serif;
        width: 100%;
        outline: none;
      }
      .tipo-badge {
        font-size: 10px;
        color: #3a3830;
        font-family: 'IBM Plex Mono', monospace;
      }
      .btn {
        padding: 8px 20px;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        font-size: 12px;
        font-family: 'IBM Plex Mono', monospace;
        letter-spacing: 1px;
        font-weight: 600;
        text-transform: uppercase;
        background: #1e2130;
        color: #e8e0d4;
        transition: all 0.15s;
      }
      .btn-primary {
        background: #d4a853;
        color: #0c0e14;
      }
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .guardado-msg {
        font-size: 12px;
        color: #22c55e;
        font-family: 'IBM Plex Mono', monospace;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #1a1c22;
        font-size: 13px;
      }
      .info-row .label {
        margin-bottom: 0;
      }
    `,
  ],
})
export class ConfiguracionComponent implements OnInit {
  config: any[] = [];
  guardado = false;
  ejecutando = false;
  resultadoAlertas: any = null;
  angularVersion = '21';

  constructor(private svc: ProyectoService) {}

  ngOnInit() {
    this.svc.getConfiguracion().subscribe((d) => (this.config = d));
  }

  guardar() {
    const saves = this.config.map((item) => this.svc.guardarConfiguracion(item));
    let completados = 0;
    saves.forEach((obs) =>
      obs.subscribe(() => {
        completados++;
        if (completados === saves.length) {
          this.guardado = true;
          setTimeout(() => (this.guardado = false), 3000);
        }
      }),
    );
  }

  ejecutarAlertas() {
    this.ejecutando = true;
    this.resultadoAlertas = null;
    this.svc.ejecutarAlertas().subscribe({
      next: (res) => {
        this.resultadoAlertas = res;
        this.ejecutando = false;
      },
      error: () => (this.ejecutando = false),
    });
  }
}
