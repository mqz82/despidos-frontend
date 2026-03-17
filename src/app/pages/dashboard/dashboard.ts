import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProyectoService, Proyecto } from '../../services/proyecto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Panel de Control</h1>
      <p class="page-sub">RESUMEN DEL SISTEMA</p>
    </div>

    <!-- STATS -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📁</div>
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">Total Expedientes</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-value" style="color:#3b82f6">{{ stats.activos }}</div>
        <div class="stat-label">Activos</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚖️</div>
        <div class="stat-value" style="color:#f59e0b">{{ stats.enJuicio }}</div>
        <div class="stat-label">En Juicio</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-value" style="color:#22c55e">{{ stats.resueltos }}</div>
        <div class="stat-label">Resueltos</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-value" [style.color]="stats.conFaltantes > 0 ? '#ef4444' : '#22c55e'">
          {{ stats.conFaltantes }}
        </div>
        <div class="stat-label">Docs. Faltantes</div>
      </div>
    </div>

    <!-- ALERTAS -->
    <div *ngFor="let p of alertas">
      <div
        class="alert-banner"
        [class.danger]="getDias(p.fechaAudiencia) <= 7"
        [class.warn]="getDias(p.fechaAudiencia) > 7"
      >
        <span>{{ getDias(p.fechaAudiencia) <= 7 ? '🚨' : '⚠️' }}</span>
        <div>
          <strong class="alert-title"
            >{{ p.numeroExpediente }} — {{ p.nombreEmpleado }} {{ p.apellidoEmpleado }}</strong
          >
          <div class="alert-body">
            Audiencia: {{ formatFecha(p.fechaAudiencia) }} ({{
              getDias(p.fechaAudiencia) >= 0
                ? 'en ' + getDias(p.fechaAudiencia) + ' días'
                : 'VENCIDA'
            }})
            <span *ngIf="getFaltantes(p) > 0" class="docs-faltantes">
              • {{ getFaltantes(p) }} doc(s) obligatorio(s) pendiente(s)
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLA PRÓXIMAS AUDIENCIAS -->
    <div class="card" *ngIf="proximas.length > 0">
      <h3 class="card-title">Audiencias próximas (30 días)</h3>
      <table class="tabla">
        <thead>
          <tr>
            <th>Expediente</th>
            <th>Empleado</th>
            <th>Fecha Audiencia</th>
            <th>Días</th>
            <th>Docs. Pendientes</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of proximas">
            <td>
              <span class="expediente-num">{{ p.numeroExpediente }}</span>
            </td>
            <td>{{ p.nombreEmpleado }} {{ p.apellidoEmpleado }}</td>
            <td>{{ formatFecha(p.fechaAudiencia) }}</td>
            <td>
              <span
                class="dias-badge"
                [style.color]="
                  getDias(p.fechaAudiencia) <= 7
                    ? '#ef4444'
                    : getDias(p.fechaAudiencia) <= 15
                      ? '#f59e0b'
                      : '#22c55e'
                "
              >
                {{ getDias(p.fechaAudiencia) }}d
              </span>
            </td>
            <td>
              <span *ngIf="getFaltantes(p) > 0" style="color:#ef4444"
                >{{ getFaltantes(p) }} pendiente(s)</span
              >
              <span *ngIf="getFaltantes(p) === 0" style="color:#22c55e">✓ Completo</span>
            </td>
            <td>
              <span
                class="badge"
                [style.background]="getEstadoColor(p.estado) + '22'"
                [style.color]="getEstadoColor(p.estado)"
                >{{ p.estado }}</span
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .page-title {
        font-size: 28px;
        font-weight: 300;
        letter-spacing: 1px;
        color: #e8e0d4;
      }
      .page-sub {
        font-size: 12px;
        color: #5a5650;
        font-family: 'IBM Plex Mono', monospace;
        letter-spacing: 1px;
        margin-bottom: 32px;
        margin-top: 4px;
      }
      .stats-grid {
        display: flex;
        gap: 16px;
        margin-bottom: 28px;
        flex-wrap: wrap;
      }
      .stat-card {
        background: #111318;
        border: 1px solid #1e2130;
        border-radius: 2px;
        padding: 24px;
        flex: 1;
        min-width: 140px;
      }
      .stat-icon {
        font-size: 22px;
        margin-bottom: 8px;
      }
      .stat-value {
        font-size: 32px;
        font-weight: 300;
        line-height: 1;
        color: #e8e0d4;
      }
      .stat-label {
        font-size: 11px;
        color: #5a5650;
        font-family: 'IBM Plex Mono', monospace;
        letter-spacing: 1px;
        margin-top: 6px;
        text-transform: uppercase;
      }

      .alert-banner {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 16px;
        border-radius: 2px;
        margin-bottom: 12px;
      }
      .alert-banner.warn {
        background: #451a03;
        border: 1px solid #92400e;
      }
      .alert-banner.danger {
        background: #450a0a;
        border: 1px solid #7f1d1d;
      }
      .alert-title {
        color: #fcd34d;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 12px;
        display: block;
        margin-bottom: 4px;
      }
      .alert-body {
        font-size: 13px;
        color: #a09880;
      }
      .docs-faltantes {
        color: #f87171;
        margin-left: 12px;
      }

      .card {
        background: #111318;
        border: 1px solid #1e2130;
        border-radius: 2px;
        padding: 24px;
        margin-bottom: 16px;
      }
      .card-title {
        font-size: 13px;
        letter-spacing: 2px;
        color: #d4a853;
        text-transform: uppercase;
        font-family: 'IBM Plex Mono', monospace;
        margin-bottom: 16px;
      }
      .tabla {
        width: 100%;
        border-collapse: collapse;
      }
      .tabla th {
        text-align: left;
        padding: 10px 16px;
        font-size: 10px;
        letter-spacing: 2px;
        color: #5a5650;
        text-transform: uppercase;
        font-family: 'IBM Plex Mono', monospace;
        border-bottom: 1px solid #1e2130;
      }
      .tabla td {
        padding: 14px 16px;
        font-size: 14px;
        border-bottom: 1px solid #111318;
      }
      .tabla tr:hover td {
        background: rgba(255, 255, 255, 0.02);
      }
      .expediente-num {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 12px;
        color: #d4a853;
      }
      .dias-badge {
        font-family: 'IBM Plex Mono', monospace;
        font-weight: 700;
        font-size: 13px;
      }
      .badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 2px;
        font-size: 10px;
        font-family: 'IBM Plex Mono', monospace;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  proyectos: Proyecto[] = [];
  proximas: Proyecto[] = [];
  alertas: Proyecto[] = [];
  stats = { total: 0, activos: 0, enJuicio: 0, resueltos: 0, conFaltantes: 0 };

  constructor(private svc: ProyectoService) {}

  ngOnInit() {
    this.svc.getProyectos().subscribe((data) => {
      this.proyectos = data;
      this.calcularStats();
      this.calcularAlertas();
      // Filtrar proximas desde los mismos datos
      this.proximas = data
        .filter((p) => {
          const dias = this.getDias(p.fechaAudiencia);
          return dias >= 0 && dias <= 30 && p.estado !== 'RESUELTO' && p.estado !== 'ARCHIVADO';
        })
        .sort((a, b) => this.getDias(a.fechaAudiencia) - this.getDias(b.fechaAudiencia));
    });
  }

  calcularStats() {
    this.stats.total = this.proyectos.length;
    this.stats.activos = this.proyectos.filter((p) => p.estado === 'ACTIVO').length;
    this.stats.enJuicio = this.proyectos.filter((p) => p.estado === 'EN_JUICIO').length;
    this.stats.resueltos = this.proyectos.filter((p) => p.estado === 'RESUELTO').length;
    this.stats.conFaltantes = this.proyectos.filter((p) => this.getFaltantes(p) > 0).length;
  }

  calcularAlertas() {
    this.alertas = this.proyectos.filter((p) => {
      if (p.estado === 'RESUELTO' || p.estado === 'ARCHIVADO') return false;
      const dias = this.getDias(p.fechaAudiencia);
      return (dias >= 0 && dias <= 30) || this.getFaltantes(p) > 0;
    });
  }

  getDias(fecha: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const f = new Date(fecha + 'T00:00:00');
    f.setHours(0, 0, 0, 0);
    return Math.ceil((f.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatFecha(f: string): string {
    if (!f) return '-';
    return new Date(f + 'T00:00:00').toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getFaltantes(p: Proyecto): number {
    return p.documentos?.filter((d) => d.obligatorio && d.estado === 'PENDIENTE').length || 0;
  }

  getEstadoColor(estado: string): string {
    const map: any = {
      ACTIVO: '#3b82f6',
      EN_JUICIO: '#f59e0b',
      RESUELTO: '#22c55e',
      ARCHIVADO: '#6b7280',
    };
    return map[estado] || '#6b7280';
  }
}
