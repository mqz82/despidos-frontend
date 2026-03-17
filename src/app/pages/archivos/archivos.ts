import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProyectoService, Proyecto } from '../../services/proyecto';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-archivos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Archivos</h1>
      <p class="page-sub">GESTIÓN DE DOCUMENTOS DIGITALES</p>
    </div>

    <!-- SELECTOR DE EXPEDIENTE -->
    <div class="card" style="margin-bottom:24px">
      <label class="label">Seleccioná un expediente</label>
      <select class="select" [(ngModel)]="proyectoSeleccionadoId" (change)="cargarArchivos()">
        <option value="">-- Seleccionar expediente --</option>
        <option *ngFor="let p of proyectos" [value]="p.id">
          {{ p.numeroExpediente }} — {{ p.nombreEmpleado }} {{ p.apellidoEmpleado }}
        </option>
      </select>
    </div>

    <!-- DOCUMENTOS DEL EXPEDIENTE -->
    <div *ngIf="proyectoSeleccionado">
      <!-- ALERTA documentos sin archivo -->
      <div *ngIf="docsSinArchivo.length > 0" class="alert-warn" style="margin-bottom:16px">
        ⚠️ <strong>{{ docsSinArchivo.length }} documento(s) sin archivo adjunto</strong>
      </div>

      <div class="card">
        <h3 class="card-title">
          Documentos — {{ proyectoSeleccionado.numeroExpediente }} ·
          {{ proyectoSeleccionado.nombreEmpleado }} {{ proyectoSeleccionado.apellidoEmpleado }}
        </h3>

        <table class="tabla">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Obligatorio</th>
              <th>Estado</th>
              <th>Archivo adjunto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doc of proyectoSeleccionado.documentos">
              <td>{{ doc.tipoDocumento.nombre }}</td>
              <td>
                <span
                  *ngIf="doc.obligatorio"
                  style="color:#d4a853;font-size:11px;font-family:'IBM Plex Mono',monospace"
                  >OBLIG.</span
                >
                <span *ngIf="!doc.obligatorio" style="color:#3a3830">—</span>
              </td>
              <td>
                <span
                  class="badge"
                  [style.background]="getDocColor(doc.estado) + '22'"
                  [style.color]="getDocColor(doc.estado)"
                >
                  {{ doc.estado }}
                </span>
              </td>
              <td>
                <!-- Sin archivo -->
                <span
                  *ngIf="!tieneArchivo(doc.id!)"
                  style="color:#3a3830;font-size:12px;font-family:'IBM Plex Mono',monospace"
                >
                  Sin archivo
                </span>
                <!-- Con archivo -->
                <div *ngIf="tieneArchivo(doc.id!)" style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:18px">{{
                    getIcono(getArchivo(doc.id!)?.archivoTipo)
                  }}</span>
                  <span style="font-size:12px;color:#a09880">{{
                    getArchivo(doc.id!)?.nombreArchivo
                  }}</span>
                </div>
              </td>
              <td>
                <div style="display:flex;gap:6px;align-items:center">
                  <!-- Subir archivo -->
                  <label class="btn btn-sm" style="cursor:pointer">
                    {{ tieneArchivo(doc.id!) ? '🔄 Reemplazar' : '📎 Adjuntar' }}
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      style="display:none"
                      (change)="subirArchivo($event, doc.id!)"
                    />
                  </label>

                  <!-- Descargar -->
                  <button
                    *ngIf="tieneArchivo(doc.id!)"
                    class="btn btn-sm"
                    (click)="descargarArchivo(doc.id!, getArchivo(doc.id!)?.nombreArchivo)"
                  >
                    ⬇ Descargar
                  </button>

                  <!-- Eliminar -->
                  <button
                    *ngIf="tieneArchivo(doc.id!)"
                    class="btn btn-danger btn-sm"
                    (click)="eliminarArchivo(doc.id!)"
                  >
                    🗑
                  </button>
                </div>

                <!-- Progreso de subida -->
                <div
                  *ngIf="subiendo[doc.id!]"
                  style="margin-top:6px;font-size:11px;color:#d4a853;font-family:'IBM Plex Mono',monospace"
                >
                  ⏳ Subiendo...
                </div>
                <div
                  *ngIf="exito[doc.id!]"
                  style="margin-top:6px;font-size:11px;color:#22c55e;font-family:'IBM Plex Mono',monospace"
                >
                  ✓ Archivo guardado
                </div>
                <div
                  *ngIf="errorMsg[doc.id!]"
                  style="margin-top:6px;font-size:11px;color:#ef4444;font-family:'IBM Plex Mono',monospace"
                >
                  ✗ Solo PDF o Word
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- RESUMEN -->
      <div style="display:flex;gap:16px;margin-top:24px">
        <div class="stat-mini">
          <div class="stat-mini-val">{{ proyectoSeleccionado.documentos?.length || 0 }}</div>
          <div class="stat-mini-label">Total documentos</div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-val" style="color:#22c55e">{{ docsConArchivo }}</div>
          <div class="stat-mini-label">Con archivo</div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-val" style="color:#f59e0b">{{ docsSinArchivo.length }}</div>
          <div class="stat-mini-label">Sin archivo</div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-val" style="color:#ef4444">{{ docsFaltantesOblig }}</div>
          <div class="stat-mini-label">Oblig. pendientes</div>
        </div>
      </div>
    </div>

    <!-- ESTADO VACÍO -->
    <div *ngIf="!proyectoSeleccionado && proyectoSeleccionadoId === ''" class="empty-state">
      <div style="font-size:48px;margin-bottom:16px">📂</div>
      <div style="font-size:18px;font-weight:300;margin-bottom:8px">Seleccioná un expediente</div>
      <div style="font-size:13px;color:#5a5650">para ver y gestionar sus archivos adjuntos</div>
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
        margin-bottom: 16px;
      }
      .label {
        font-size: 11px;
        letter-spacing: 1.5px;
        color: #5a5650;
        text-transform: uppercase;
        font-family: 'IBM Plex Mono', monospace;
        display: block;
        margin-bottom: 8px;
      }
      .select {
        background: #0c0e14;
        border: 1px solid #1e2130;
        border-radius: 2px;
        padding: 8px 12px;
        color: #e8e0d4;
        font-size: 14px;
        width: 100%;
        outline: none;
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
        display: inline-block;
      }
      .btn-primary {
        background: #d4a853;
        color: #0c0e14;
      }
      .btn-danger {
        background: #7f1d1d;
        color: #fca5a5;
      }
      .btn-sm {
        padding: 4px 10px;
        font-size: 11px;
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
        vertical-align: middle;
      }
      .tabla tr:hover td {
        background: rgba(255, 255, 255, 0.02);
      }
      .alert-warn {
        background: #451a03;
        border: 1px solid #92400e;
        border-radius: 2px;
        padding: 12px 16px;
        font-size: 13px;
        color: #fcd34d;
      }
      .stat-mini {
        background: #111318;
        border: 1px solid #1e2130;
        border-radius: 2px;
        padding: 16px 24px;
        flex: 1;
      }
      .stat-mini-val {
        font-size: 28px;
        font-weight: 300;
        color: #e8e0d4;
      }
      .stat-mini-label {
        font-size: 11px;
        color: #5a5650;
        font-family: 'IBM Plex Mono', monospace;
        text-transform: uppercase;
        margin-top: 4px;
      }
      .empty-state {
        text-align: center;
        padding: 80px 40px;
        color: #5a5650;
        font-family: 'IBM Plex Mono', monospace;
      }
    `,
  ],
})
export class ArchivosComponent implements OnInit {
  private baseUrl = 'http://localhost:8080/api';

  proyectos: Proyecto[] = [];
  proyectoSeleccionadoId: string = '';
  proyectoSeleccionado: Proyecto | null = null;
  archivos: any[] = [];
  subiendo: { [key: number]: boolean } = {};
  exito: { [key: number]: boolean } = {};
  errorMsg: { [key: number]: boolean } = {};

  constructor(
    private svc: ProyectoService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.svc.getProyectos().subscribe((d) => (this.proyectos = d));
  }

  cargarArchivos() {
    if (!this.proyectoSeleccionadoId) {
      this.proyectoSeleccionado = null;
      return;
    }
    const id = Number(this.proyectoSeleccionadoId);
    this.svc.getProyecto(id).subscribe((p: Proyecto) => {
      this.proyectoSeleccionado = p;
      // Cargar metadata de archivos
      this.http
        .get<any[]>(`${this.baseUrl}/archivos/expediente/${id}`)
        .subscribe((data) => (this.archivos = data));
    });
  }

  subirArchivo(event: any, documentoId: number) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo
    const tiposValidos = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!tiposValidos.includes(file.type)) {
      this.errorMsg[documentoId] = true;
      setTimeout(() => (this.errorMsg[documentoId] = false), 3000);
      return;
    }

    this.subiendo[documentoId] = true;
    this.exito[documentoId] = false;

    const formData = new FormData();
    formData.append('archivo', file);

    this.http.post<any>(`${this.baseUrl}/archivos/subir/${documentoId}`, formData).subscribe({
      next: (res) => {
        this.subiendo[documentoId] = false;
        this.exito[documentoId] = true;
        // Actualizar la lista de archivos
        this.archivos = this.archivos.filter((a) => a.id !== documentoId);
        this.archivos.push({
          id: documentoId,
          nombreArchivo: file.name,
          archivoTipo: file.type,
          tipoDocumento: '',
          estado: 'RECIBIDO',
        });
        setTimeout(() => (this.exito[documentoId] = false), 3000);
      },
      error: () => {
        this.subiendo[documentoId] = false;
        this.errorMsg[documentoId] = true;
        setTimeout(() => (this.errorMsg[documentoId] = false), 3000);
      },
    });
  }

  descargarArchivo(documentoId: number, nombreArchivo: string) {
    this.http
      .get(`${this.baseUrl}/archivos/descargar/${documentoId}`, { responseType: 'blob' })
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  eliminarArchivo(documentoId: number) {
    if (!confirm('¿Eliminar el archivo adjunto?')) return;
    this.http.delete(`${this.baseUrl}/archivos/eliminar/${documentoId}`).subscribe(() => {
      this.archivos = this.archivos.filter((a) => a.id !== documentoId);
    });
  }

  tieneArchivo(documentoId: number): boolean {
    return this.archivos.some((a) => a.id === documentoId);
  }

  getArchivo(documentoId: number): any {
    return this.archivos.find((a) => a.id === documentoId);
  }

  getIcono(tipo: string): string {
    if (!tipo) return '📄';
    if (tipo === 'application/pdf') return '📕';
    if (tipo.includes('word')) return '📘';
    return '📄';
  }

  getDocColor(estado: string): string {
    const map: any = {
      RECIBIDO: '#22c55e',
      PENDIENTE: '#f59e0b',
      EN_TRAMITE: '#3b82f6',
      VENCIDO: '#ef4444',
      NO_APLICA: '#6b7280',
    };
    return map[estado] || '#6b7280';
  }

  get docsSinArchivo() {
    return this.proyectoSeleccionado?.documentos?.filter((d) => !this.tieneArchivo(d.id!)) || [];
  }

  get docsConArchivo(): number {
    return (
      this.proyectoSeleccionado?.documentos?.filter((d) => this.tieneArchivo(d.id!)).length || 0
    );
  }

  get docsFaltantesOblig(): number {
    return (
      this.proyectoSeleccionado?.documentos?.filter(
        (d) => d.obligatorio && d.estado === 'PENDIENTE',
      ).length || 0
    );
  }

}
