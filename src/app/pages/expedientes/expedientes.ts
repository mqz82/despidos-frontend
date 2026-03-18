import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProyectoService, Proyecto, TipoDocumento } from '../../services/proyecto';
import { RutService } from '../../services/rut';
import {ToastService } from '../../shared/toast';
import { ChangeDetectorRef } from '@angular/core';



@Component({
  selector: 'app-expedientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Expedientes</h1>
      <p class="page-sub">GESTIÓN DE CASOS DE DESPIDO</p>
    </div>

    <!-- BARRA BÚSQUEDA -->
    <div class="toolbar">
      <input
        class="input-search"
        [(ngModel)]="busqueda"
        placeholder="Buscar por nombre, expediente ..."
      />
      <select class="select" [(ngModel)]="filtroEstado">
        <option value="TODOS">Todos los estados</option>
        <option value="ACTIVO">Activo</option>
        <option value="EN_JUICIO">En Juicio</option>
        <option value="RESUELTO">Resuelto</option>
        <option value="ARCHIVADO">Archivado</option>
      </select>
      <div class="spacer"></div>
      <button class="btn btn-primary" (click)="abrirFormNuevo()">+ Nuevo Expediente</button>
    </div>

    <!-- TABLA -->
    <div class="card">
      <table class="tabla">
        <thead>
          <tr>
            <th>Expediente</th>
            <th>Empleado</th>
            <th>Área</th>
            <th>Tipo Despido</th>
            <th>Audiencia</th>
            <th>Días</th>
            <th>Docs.</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of filtrados" (click)="verDetalle(p)" style="cursor:pointer">
            <td>
              <span class="exp-num">{{ p.nombreExpediente }}</span>
            </td>
            <td>
              <div style="font-weight:500">{{ p.nombreEmpleado }} {{ p.apellidoEmpleado }}</div>
              <div style="font-size:11px;color:#5a5650">{{ p.legajo }}</div>
            </td>
            <td>{{ p.areaDepartamento || '—' }}</td>
            <td style="font-size:12px">{{ tipoDespidoLabel[p.tipoDespido || ''] || '—' }}</td>
            <td>{{ formatFecha(p.fechaAudiencia) }}</td>
            <td>
              <span
                class="dias-num"
                [style.color]="
                  getDias(p.fechaAudiencia) <= 7
                    ? '#ef4444'
                    : getDias(p.fechaAudiencia) <= 30
                      ? '#f59e0b'
                      : '#7a7669'
                "
              >
                {{ getDias(p.fechaAudiencia) >= 0 ? getDias(p.fechaAudiencia) + 'd' : '—' }}
              </span>
            </td>
            <td>
              <div style="font-size:12px">
                {{ getRecibidos(p) }}/{{ p.documentos?.length || 0 }}
              </div>
              <div
                *ngIf="getFaltantes(p) > 0"
                style="font-size:10px;color:#ef4444;font-family:'IBM Plex Mono',monospace"
              >
                {{ getFaltantes(p) }} oblig.
              </div>
            </td>
            <td>
              <span
                class="badge"
                [style.background]="getEstadoColor(p.estado) + '22'"
                [style.color]="getEstadoColor(p.estado)"
                >{{ p.estado }}</span
              >
            </td>
            <td (click)="$event.stopPropagation()">
              <button class="btn btn-danger btn-sm" (click)="eliminar(p.id!)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="filtrados.length === 0" class="empty">No se encontraron expedientes</div>
    </div>

    <!-- MODAL DETALLE -->
    <div class="modal-overlay" *ngIf="proyectoViendo" (click)="cerrarDetalle()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <div class="exp-num">{{ proyectoViendo.nombreExpediente }}</div>
            <h2 style="font-size:26px;font-weight:300">
              {{ proyectoViendo.nombreEmpleado }} {{ proyectoViendo.apellidoEmpleado }}
            </h2>
          </div>
          <div style="display:flex;gap:8px;align-items:flex-start">
            <span
              class="badge"
              [style.background]="getEstadoColor(proyectoViendo.estado) + '22'"
              [style.color]="getEstadoColor(proyectoViendo.estado)"
              >{{ proyectoViendo.estado }}</span
            >
            <button class="btn" (click)="editarProyecto(proyectoViendo)">Editar</button>
            <button class="btn btn-ghost" (click)="cerrarDetalle()">✕</button>
          </div>
        </div>

        <div *ngIf="getFaltantes(proyectoViendo) > 0" class="alert-warn">
          ⚠️ <strong>DOCUMENTOS OBLIGATORIOS PENDIENTES: </strong>
          {{ getDocsFaltantesNombres(proyectoViendo) }}
        </div>

        <div class="detalle-grid">
          <div class="card">
            <div class="section-title">Empleado</div>
            <div *ngFor="let item of getEmpleadoItems(proyectoViendo)" class="detalle-row">
              <span class="detalle-key">{{ item.key }}</span>
              <span class="detalle-val">{{ item.val }}</span>
            </div>
          </div>
          <div class="card">
            <div class="section-title">Juicio</div>
            <div class="audiencia-fecha">{{ formatFecha(proyectoViendo.fechaAudiencia) }}</div>
            <div
              class="audiencia-dias"
              [style.color]="
                getDias(proyectoViendo.fechaAudiencia) <= 7
                  ? '#ef4444'
                  : getDias(proyectoViendo.fechaAudiencia) <= 30
                    ? '#f59e0b'
                    : '#22c55e'
              "
            >
              {{
                getDias(proyectoViendo.fechaAudiencia) >= 0
                  ? 'En ' + getDias(proyectoViendo.fechaAudiencia) + ' días'
                  : 'Audiencia vencida'
              }}
            </div>
            <div *ngFor="let item of getJuicioItems(proyectoViendo)" class="detalle-row">
              <span class="detalle-key">{{ item.key }}</span>
              <span class="detalle-val">{{ item.val }}</span>
            </div>
          </div>
        </div>

        <!-- DOCUMENTOS -->
        <div class="card" style="margin-top:16px">
          <div class="section-title">Documentos</div>
          <table class="tabla">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Obligatorio</th>
                <th>Estado</th>
                <th>Fecha Recepción</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let doc of proyectoViendo.documentos">
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
                    >{{ doc.estado }}</span
                  >
                </td>
                <td>{{ formatFecha(doc.fechaRecepcion || '') }}</td>
                <td>
                  <select
                    class="select select-sm"
                    [(ngModel)]="doc.estado"
                    (change)="actualizarDoc(doc)"
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_TRAMITE">En Trámite</option>
                    <option value="RECIBIDO">Recibido</option>
                    <option value="VENCIDO">Vencido</option>
                    <option value="NO_APLICA">No Aplica</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="proyectoViendo.notas" class="card" style="margin-top:16px">
          <div class="section-title">Notas</div>
          <p style="font-size:14px;color:#a09880;line-height:1.7">{{ proyectoViendo.notas }}</p>
        </div>
      </div>
    </div>

    <!-- MODAL FORMULARIO -->
    <div class="modal-overlay" *ngIf="mostrarForm" (click)="cerrarForm()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 style="font-size:22px;font-weight:300">
              {{ editando ? 'Editar Expediente' : 'Nuevo Expediente' }}
            </h2>
            <p
              style="font-size:12px;color:#5a5650;font-family:'IBM Plex Mono',monospace;margin-top:4px"
            >
              CASO DE DESPIDO
            </p>
          </div>
          <button class="btn btn-ghost" (click)="cerrarForm()">✕ Cerrar</button>
        </div>

        <div class="section-title gold">— Datos del Expediente</div>
        <div class="form-grid2">
          <div class="field">
            <label class="label">Nombre Expediente *</label
            ><input
              class="input"
              [(ngModel)]="form.nombreExpediente"
              maxlength="255"
              tabindex="1"
            />
          </div>
          <div class="field">
            <label class="label">Estado</label>
            <select class="select" [(ngModel)]="form.estado" tabindex="2">
              <option value="ACTIVO">Activo</option>
              <option value="EN_JUICIO">En Juicio</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="ARCHIVADO">Archivado</option>
            </select>
          </div>
        </div>

        <hr class="divider" />
        <div class="section-title gold">— Datos del Empleado</div>
        <div class="form-grid3">
          <div class="field">
            <label class="label">Rut Empleado</label
            ><input
              class="input"
              type="text"
              [(ngModel)]="form.rutEmpleado"
              (ngModelChange)="onRutEmpleadoChange($event)"
              placeholder="00.000.000-0"
              tabindex="3"
            />
            <span
              *ngIf="!rutEmpleadoValido"
              style="color:#ef4444;font-size:11px;font-family:'IBM Plex Mono',monospace"
            >
              ✗ RUT inválido
            </span>
          </div>
          <div class="field">
            <label class="label">Nombre *</label
            ><input class="input" [(ngModel)]="form.nombreEmpleado" tabindex="4" />
          </div>
          <div class="field">
            <label class="label">Apellido *</label
            ><input class="input" [(ngModel)]="form.apellidoEmpleado" tabindex="5" />
          </div>
          <div class="field">
            <label class="label">Área</label
            ><input class="input" [(ngModel)]="form.areaDepartamento" tabindex="6" />
          </div>
          <div class="field">
            <label class="label">Email Empleado</label
            ><input class="input" type="email" [(ngModel)]="form.emailEmpleado" tabindex="7" />
          </div>
        </div>
        <div class="form-grid3" style="margin-top:14px">
          <div class="field">
            <label class="label">Fecha Ingreso</label
            ><input class="input" type="date" [(ngModel)]="form.fechaIngreso" tabindex="8" />
          </div>
          <div class="field">
            <label class="label">Fecha Despido</label
            ><input class="input" type="date" [(ngModel)]="form.fechaDespido" tabindex="9" />
          </div>
          <div class="field">
            <label class="label">Tipo Despido</label>
            <select class="select" [(ngModel)]="form.tipoDespido" tabindex="10">
              <option *ngFor="let t of tiposDespido" [value]="t.value">{{ t.label }}</option>
            </select>
          </div>
        </div>
        <div class="form-grid2" style="margin-top:14px">
          <div class="field">
            <label class="label">Monto Indemnización ($)</label
            ><input
              class="input"
              type="number"
              [(ngModel)]="form.montoIndemnizacion"
              tabindex="11"
            />
          </div>
        </div>

        <hr class="divider" />
        <div class="section-title gold">— Datos del Juicio</div>
        <div class="form-grid2">
          <div class="field">
            <label class="label">Fecha Audiencia *</label
            ><input class="input" type="date" [(ngModel)]="form.fechaAudiencia" tabindex="12" />
          </div>
          <div class="field">
            <label class="label">Dirección del trabajo</label
            ><input class="input" [(ngModel)]="form.direccionTrabajo" tabindex="13" />
          </div>
        </div>
        <div class="form-grid2" style="margin-top:14px">
          <div class="field">
            <label class="label">N° Causa</label
            ><input class="input" [(ngModel)]="form.numeroCausa" tabindex="14" />
          </div>
          <div class="field">
            <label class="label">Días anticipación alerta</label
            ><input
              class="input"
              type="number"
              [(ngModel)]="form.diasAnticipacionAlerta"
              tabindex="15"
            />
          </div>
        </div>
        <div class="form-grid2" style="margin-top:14px">
          <div class="field">
            <label class="label">Rut Abogado Empleado</label
            ><input
              class="input"
              [(ngModel)]="form.rutAbogadoEmpleado"
              (ngModelChange)="onRutAbogadoEmpleadoChange($event)"
              placeholder="00.00.000-0"
              tabindex="16"
            />
            <span
              *ngIf="!rutAbogadoEmpleadoValido"
              style="color:#ef4444;font-size:11px;font-family:'IBM Plex Mono',monospace"
            >
              ✗ RUT inválido
            </span>
          </div>
          <div class="field">
            <label class="label">Nombre Abogado Empleado</label
            ><input class="input" [(ngModel)]="form.abogadoEmpleado" tabindex="17" />
          </div>
        </div>
        <div class="form-grid2" style="margin-top:14px">
          <div class="field">
            <label class="label">Rut Abogado Empresa</label
            ><input
              class="input"
              [(ngModel)]="form.rutAbogadoEmpresa"
              (ngModelChange)="onRutAbogadoEmpresaChange($event)"
              placeholder="00.000.000-0"
              tabindex="18"
            />
            <span
              *ngIf="!rutAbogadoEmpresaValido"
              style="color:#ef4444;font-size:11px;font-family:'IBM Plex Mono',monospace"
            >
              ✗ RUT inválido
            </span>
          </div>
          <div class="field">
            <label class="label">Nombre Abogado Empresa</label>
            <input class="input" [(ngModel)]="form.abogadoEmpresa" tabindex="18" />
          </div>
        </div>

        <hr class="divider" />
        <div class="section-title gold">— Documentos Requeridos</div>
        <div class="docs-grid">
          <div
            *ngFor="let tipo of tiposDocumento"
            class="doc-item"
            [class.selected]="isDocSeleccionado(tipo.id!)"
            (click)="toggleDoc(tipo)"
          >
            <div class="doc-check">
              <span *ngIf="isDocSeleccionado(tipo.id!)">✓</span>
            </div>
            <div style="flex:1">
              <div
                style="font-size:13px"
                [style.color]="isDocSeleccionado(tipo.id!) ? '#e8e0d4' : '#5a5650'"
              >
                {{ tipo.nombre }}
              </div>
              <div
                *ngIf="tipo.obligatorio"
                style="font-size:10px;color:#d4a853;font-family:'IBM Plex Mono',monospace;letter-spacing:1px"
              >
                OBLIGATORIO
              </div>
            </div>
            <select
              *ngIf="isDocSeleccionado(tipo.id!)"
              class="select select-sm"
              [ngModel]="getDocEstado(tipo.id!)"
              (ngModelChange)="setDocEstado(tipo.id!, $event)"
              (click)="$event.stopPropagation()"
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_TRAMITE">En Trámite</option>
              <option value="RECIBIDO">Recibido</option>
            </select>
          </div>
        </div>

        <hr class="divider" />
        <div class="field">
          <label class="label">Observaciones</label
          ><textarea
            class="input"
            style="min-height:80px;resize:vertical"
            [(ngModel)]="form.notas"
            tabindex="19"
          ></textarea>
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:28px">
          <button class="btn btn-ghost" (click)="cerrarForm()">Cancelar</button>
          <button class="btn btn-primary" (click)="guardar()" tabindex="20">
            Guardar Expediente
          </button>
        </div>
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
      .toolbar {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
        align-items: center;
      }
      .spacer {
        flex: 1;
      }
      .input-search {
        background: #0c0e14;
        border: 1px solid #1e2130;
        border-radius: 2px;
        padding: 8px 12px;
        color: #e8e0d4;
        font-size: 14px;
        width: 360px;
        outline: none;
        font-family: 'Crimson Pro', serif;
      }
      .select {
        background: #0c0e14;
        border: 1px solid #1e2130;
        border-radius: 2px;
        padding: 8px 12px;
        color: #e8e0d4;
        font-size: 14px;
        outline: none;
      }
      .select-sm {
        padding: 3px 6px;
        font-size: 11px;
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
      .btn-danger {
        background: #7f1d1d;
        color: #fca5a5;
      }
      .btn-ghost {
        background: transparent;
        color: #7a7669;
        border: 1px solid #1e2130;
      }
      .btn-sm {
        padding: 4px 10px;
        font-size: 11px;
      }
      .card {
        background: #111318;
        border: 1px solid #1e2130;
        border-radius: 2px;
        padding: 24px;
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
      .exp-num {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 12px;
        color: #d4a853;
      }
      .dias-num {
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
      .empty {
        text-align: center;
        padding: 40px;
        color: #3a3830;
        font-family: 'IBM Plex Mono', monospace;
      }
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        z-index: 1000;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 40px 20px;
        overflow-y: auto;
      }
      .modal-content {
        background: #111318;
        border: 1px solid #1e2130;
        border-radius: 2px;
        width: 100%;
        max-width: 900px;
        padding: 36px;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }
      .alert-warn {
        background: #451a03;
        border: 1px solid #92400e;
        border-radius: 2px;
        padding: 12px 16px;
        margin-bottom: 16px;
        font-size: 13px;
        color: #fcd34d;
      }
      .detalle-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .section-title {
        font-size: 11px;
        letter-spacing: 2px;
        color: #5a5650;
        text-transform: uppercase;
        font-family: 'IBM Plex Mono', monospace;
        margin-bottom: 14px;
      }
      .section-title.gold {
        color: #d4a853;
        margin-bottom: 16px;
      }
      .detalle-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid #1a1c22;
      }
      .detalle-key {
        font-size: 11px;
        color: #5a5650;
        font-family: 'IBM Plex Mono', monospace;
      }
      .detalle-val {
        font-size: 13px;
      }
      .audiencia-fecha {
        font-size: 22px;
        font-weight: 300;
        margin-bottom: 4px;
      }
      .audiencia-dias {
        font-size: 12px;
        font-family: 'IBM Plex Mono', monospace;
        margin-bottom: 12px;
      }
      .form-grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .form-grid3 {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 20px;
      }
      .field {
      }
      .label {
        font-size: 11px;
        letter-spacing: 1.5px;
        color: #5a5650;
        text-transform: uppercase;
        font-family: 'IBM Plex Mono', monospace;
        display: block;
        margin-bottom: 6px;
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
      .divider {
        border: none;
        border-top: 1px solid #1e2130;
        margin: 24px 0;
      }
      .docs-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 16px;
      }
      .doc-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        background: #0c0e14;
        border: 1px solid #1e2130;
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .doc-item.selected {
        background: rgba(212, 168, 83, 0.08);
        border-color: #d4a85344;
      }
      .doc-check {
        width: 16px;
        height: 16px;
        border-radius: 2px;
        border: 2px solid #2e3040;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 10px;
        font-weight: 900;
        color: #0c0e14;
      }
      .doc-item.selected .doc-check {
        background: #d4a853;
        border-color: #d4a853;
      }
    `,
  ],
})
export class ExpedientesComponent implements OnInit {
  proyectos: Proyecto[] = [];
  tiposDocumento: TipoDocumento[] = [];
  busqueda = '';
  filtroEstado = 'TODOS';
  mostrarForm = false;
  editando: Proyecto | null = null;
  proyectoViendo: Proyecto | null = null;
  docSeleccionados: { tipoId: number; estado: string; obligatorio: boolean; id?: number }[] = [];

  form: Proyecto = this.formVacio();
  rutEmpleadoValido = true;
  rutAbogadoEmpresaValido = true;
  rutAbogadoEmpleadoValido = true;

  tiposDespido = [
    { value: 'DESVINCULACION_VOLUNTARIA', label: 'Desvinculación Voluntaria (por el trabajador)' },
    { value: 'MUTUO_ACUERDO', label: 'Mutuo Acuerdo' },
    {
      value: 'DESVINCULACION_INVOLUNTARIA',
      label: 'Desvinculación Involuntaria (Despido por el empleador)',
    },
    {
      value: 'CAUSALES_DISCIPLINARIAS',
      label: 'Causales Disciplinarias / Incumplimientos (Art. 160)',
    },
    { value: 'CAUSALES_OBJETIVAS', label: 'Causales Objetivas (Art. 159)' },
    { value: 'OTRAS_CAUSALES', label: 'Otras Causales' },
  ];

  tipoDespidoLabel: any = {
    DESVINCULACION_VOLUNTARIA: 'Desvinculación Voluntaria',
    MUTUO_ACUERDO: 'Mutuo Acuerdo',
    DESVINCULACION_INVOLUNTARIA: 'Desvinculación Involuntaria',
    CAUSALES_DISCIPLINARIAS: 'Causales Disciplinarias (Art. 160)',
    CAUSALES_OBJETIVAS: 'Causales Objetivas (Art. 159)',
    OTRAS_CAUSALES: 'Otras Causales',
  };

  constructor(
    private svc: ProyectoService,
    private rutSvc: RutService,
    private toastSvc: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.svc.getProyectos().subscribe((d) => (this.proyectos = d));
    this.svc.getTiposDocumento().subscribe((d) => (this.tiposDocumento = d));
  }

  get filtrados(): Proyecto[] {
    return this.proyectos.filter((p) => {
      const matchBusq =
        !this.busqueda ||
        `${p.nombreEmpleado} ${p.apellidoEmpleado} ${p.nombreExpediente} ${p.legajo}`
          .toLowerCase()
          .includes(this.busqueda.toLowerCase());
      const matchEstado = this.filtroEstado === 'TODOS' || p.estado === this.filtroEstado;
      return matchBusq && matchEstado;
    });
  }

  abrirFormNuevo() {
    this.editando = null;
    this.form = this.formVacio();
    this.docSeleccionados = this.tiposDocumento
      .filter((t) => t.obligatorio)
      .map((t) => ({ tipoId: t.id!, estado: 'PENDIENTE', obligatorio: true }));
    this.mostrarForm = true;
  }

  editarProyecto(p: Proyecto) {
    this.editando = p;
    this.form = { ...p };
    this.docSeleccionados =
      p.documentos?.map((d) => ({
        tipoId: d.tipoDocumento.id,
        estado: d.estado,
        obligatorio: d.obligatorio,
        id: d.id,
      })) || [];
    this.proyectoViendo = null;
    this.mostrarForm = true;
  }

  guardar() {
    // Validar campos obligarios
    if (!this.form.nombreExpediente || !this.form.fechaAudiencia || !this.form.tipoDespido) {
      this.toastSvc.error(
        ' Nombre Expediente, Fecha Audiencia y Tipo Despido son campos obligatorios antes de guardar',
      );
      return;
    }

    const docs = this.docSeleccionados.map((d) => ({
      ...(d.id ? { id: d.id } : {}),
      tipoDocumento: { id: d.tipoId, nombre: '' },
      estado: d.estado,
      obligatorio: d.obligatorio,
    }));
    const payload = { ...this.form, documentos: docs };
    if (this.editando?.id) {
      this.svc.actualizarProyecto(this.editando.id, payload).subscribe({
        next: (updated) => {
          this.proyectos = this.proyectos.map((p) => (p.id === updated.id ? updated : p));
          this.mostrarForm = false;
          this.editando = null;
          this.form = this.formVacio();
          this.docSeleccionados = [];
          this.cdr.detectChanges();
          setTimeout(() => this.toastSvc.exito('Expediente actualizado correctamente'), 100);
        },
        error: () => this.toastSvc.error('Error al actualizar el expediente'),
      });
    } else {
      this.svc.crearProyecto(payload).subscribe({
        next: (nuevo) => {
          this.proyectos = [...this.proyectos, nuevo];
          this.mostrarForm = false;
          this.editando = null;
          this.form = this.formVacio();
          this.docSeleccionados = [];
          this.cdr.detectChanges();
          setTimeout(() => this.toastSvc.exito('Expediente creado correctamente'), 100);
        },
        error: () => this.toastSvc.error('Error al crear el expediente'),
      });
    }
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar este expediente?')) {
      this.svc.eliminarProyecto(id).subscribe(() => {
        this.proyectos = this.proyectos.filter((p) => p.id !== id);
      });
    }
  }

  verDetalle(p: Proyecto) {
    this.proyectoViendo = { ...p, documentos: [...(p.documentos || [])] };
  }
  cerrarDetalle() {
    this.proyectoViendo = null;
  }
  cerrarForm() {
    this.mostrarForm = false;
    this.editando = null;
    this.form = this.formVacio();
    this.docSeleccionados = [];
  }

  actualizarDoc(doc: any) {
    if (doc.id) this.svc.actualizarDocumento(doc.id, doc).subscribe();
  }

  toggleDoc(tipo: TipoDocumento) {
    const idx = this.docSeleccionados.findIndex((d) => d.tipoId === tipo.id);
    if (idx >= 0) this.docSeleccionados.splice(idx, 1);
    else
      this.docSeleccionados.push({
        tipoId: tipo.id!,
        estado: 'PENDIENTE',
        obligatorio: tipo.obligatorio,
      });
  }

  isDocSeleccionado(tipoId: number): boolean {
    return this.docSeleccionados.some((d) => d.tipoId === tipoId);
  }
  getDocEstado(tipoId: number): string {
    return this.docSeleccionados.find((d) => d.tipoId === tipoId)?.estado || 'PENDIENTE';
  }
  setDocEstado(tipoId: number, estado: string) {
    const d = this.docSeleccionados.find((d) => d.tipoId === tipoId);
    if (d) d.estado = estado;
  }

  getDias(fecha: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const f = new Date(fecha + 'T00:00:00');
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
  getRecibidos(p: Proyecto): number {
    return p.documentos?.filter((d) => d.estado === 'RECIBIDO').length || 0;
  }
  getDocsFaltantesNombres(p: Proyecto): string {
    return (
      p.documentos
        ?.filter((d) => d.obligatorio && d.estado === 'PENDIENTE')
        .map((d) => d.tipoDocumento.nombre)
        .join(', ') || ''
    );
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

  getEmpleadoItems(p: Proyecto) {
    return [
      { key: 'Área', val: p.areaDepartamento },
      { key: 'Fecha Ingreso', val: this.formatFecha(p.fechaIngreso || '') },
      { key: 'Fecha Despido', val: this.formatFecha(p.fechaDespido || '') },
      { key: 'Tipo Despido', val: this.tipoDespidoLabel[p.tipoDespido || ''] },
      {
        key: 'Indemnización',
        val: p.montoIndemnizacion ? '$' + p.montoIndemnizacion.toLocaleString('es-AR') : '-',
      },
      { key: 'RUT', val: p.rutEmpleado },
    ].filter((i) => i.val);
  }

  getJuicioItems(p: Proyecto) {
    return [
      { key: 'Dirección del trabajo', val: p.direccionTrabajo },
      { key: 'N° Causa', val: p.numeroCausa },
      { key: 'Abogado Empresa', val: p.abogadoEmpresa },
      { key: 'Abogado Empleado', val: p.abogadoEmpleado },
      {
        key: 'Alerta',
        val: p.diasAnticipacionAlerta ? p.diasAnticipacionAlerta + ' días antes' : null,
      },
    ].filter((i) => i.val);
  }

  onRutEmpleadoChange(valor: string) {
    this.form.rutEmpleado = this.rutSvc.formatear(valor);
    this.rutEmpleadoValido = this.rutSvc.validar(this.form.rutEmpleado || '');
  }

  onRutAbogadoEmpresaChange(valor: string) {
    this.form.rutAbogadoEmpresa = this.rutSvc.formatear(valor);
    this.rutAbogadoEmpresaValido = this.rutSvc.validar(this.form.rutAbogadoEmpresa || '');
  }

  onRutAbogadoEmpleadoChange(valor: string) {
    this.form.rutAbogadoEmpleado = this.rutSvc.formatear(valor);
    this.rutAbogadoEmpleadoValido = this.rutSvc.validar(this.form.rutAbogadoEmpleado || '');
  }
  formVacio(): Proyecto {
    return {
      nombreExpediente: '',
      estado: 'ACTIVO',
      nombreEmpleado: '',
      apellidoEmpleado: '',
      fechaAudiencia: '',
      tipoDespido: 'SIN_CAUSA',
      diasAnticipacionAlerta: 30,
    };
  }
}
