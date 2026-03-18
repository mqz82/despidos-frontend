import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProyectoService, TipoDocumento } from '../../services/proyecto';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Tipos de Documento</h1>
      <p class="page-sub">CATÁLOGO CONFIGURABLE</p>
    </div>

    <div class="layout">
      <!-- FORMULARIO -->
      <div class="card">
        <h3 class="card-title">{{ editandoId ? 'Editar Tipo' : 'Nuevo Tipo de Documento' }}</h3>

        <div class="field"><label class="label">Nombre *</label><input class="input" [(ngModel)]="form.nombre" /></div>
        <div class="field" style="margin-top:14px"><label class="label">Descripción</label><input class="input" [(ngModel)]="form.descripcion" /></div>
        <div class="field" style="margin-top:14px">
          <label class="label">Categoría</label>
          <select class="select" [(ngModel)]="form.categoria">
            <option value="LABORAL">Laboral</option>
            <option value="LEGAL">Legal</option>
            <option value="CONTABLE">Contable</option>
            <option value="MEDICO">Médico</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
        <div class="field" style="margin-top:14px;display:flex;align-items:center;gap:10px">
          <input type="checkbox" id="oblig" [(ngModel)]="form.obligatorio" style="width:16px;height:16px;accent-color:#d4a853" />
          <label for="oblig" class="label" style="margin-bottom:0;cursor:pointer">Documento obligatorio</label>
        </div>

        <div style="display:flex;gap:8px;margin-top:20px">
          <button class="btn btn-primary" (click)="guardar()">{{ editandoId ? 'Actualizar' : 'Agregar' }}</button>
          <button class="btn btn-ghost" *ngIf="editandoId" (click)="cancelarEdicion()">Cancelar</button>
        </div>
      </div>

      <!-- LISTA -->
      <div class="card">
        <h3 class="card-title">Tipos de Documento ({{ tiposDocumento.length }})</h3>
        <div *ngFor="let t of tiposDocumento" class="tipo-row">
          <div style="flex:1">
            <div style="font-size:14px">{{ t.nombre }}</div>
            <div style="display:flex;gap:8px;margin-top:4px">
              <span class="badge" [style.background]="getCatColor(t.categoria)+'22'" [style.color]="getCatColor(t.categoria)">{{ t.categoria }}</span>
              <span class="badge" *ngIf="t.obligatorio" style="background:#d4a85322;color:#d4a853">Obligatorio</span>
            </div>
            <div *ngIf="t.descripcion" style="font-size:12px;color:#5a5650;margin-top:4px">{{ t.descripcion }}</div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm" (click)="editar(t)">Editar</button>
            <button class="btn btn-danger btn-sm" (click)="eliminar(t.id!)">Quitar</button>
          </div>
        </div>
        <div *ngIf="tiposDocumento.length === 0" class="empty">No hay tipos de documento</div>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 28px; font-weight: 300; color: #e8e0d4; }
    .page-sub { font-size: 12px; color: #5a5650; font-family: 'IBM Plex Mono', monospace; margin-bottom: 32px; margin-top: 4px; }
    .layout { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
    .card { background: #111318; border: 1px solid #1e2130; border-radius: 2px; padding: 24px; height: fit-content; }
    .card-title { font-size: 13px; letter-spacing: 2px; color: #d4a853; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace; margin-bottom: 20px; }
    .field { }
    .label { font-size: 11px; letter-spacing: 1.5px; color: #5a5650; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace; display: block; margin-bottom: 6px; }
    .input { background: #0c0e14; border: 1px solid #1e2130; border-radius: 2px; padding: 8px 12px; color: #e8e0d4; font-size: 14px; font-family: 'Crimson Pro', serif; width: 100%; outline: none; }
    .select { background: #0c0e14; border: 1px solid #1e2130; border-radius: 2px; padding: 8px 12px; color: #e8e0d4; font-size: 14px; width: 100%; outline: none; }
    .btn { padding: 8px 20px; border: none; border-radius: 2px; cursor: pointer; font-size: 12px; font-family: 'IBM Plex Mono', monospace; letter-spacing: 1px; font-weight: 600; text-transform: uppercase; background: #1e2130; color: #e8e0d4; transition: all 0.15s; }
    .btn-primary { background: #d4a853; color: #0c0e14; }
    .btn-danger { background: #7f1d1d; color: #fca5a5; }
    .btn-ghost { background: transparent; color: #7a7669; border: 1px solid #1e2130; }
    .btn-sm { padding: 4px 10px; font-size: 11px; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 2px; font-size: 10px; font-family: 'IBM Plex Mono', monospace; letter-spacing: 1px; text-transform: uppercase; }
    .tipo-row { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #1a1c22; }
    .empty { text-align: center; padding: 40px; color: #3a3830; font-family: 'IBM Plex Mono', monospace; }
  `]
})
export class DocumentosComponent implements OnInit {
  tiposDocumento: TipoDocumento[] = [];
  editandoId: number | null = null;
  form: TipoDocumento = this.formVacio();

  constructor(
    private svc: ProyectoService,
    private cdr: ChangeDetectorRef,
) {}

  ngOnInit() {
    this.svc.getTiposDocumento().subscribe(d =>{
      this.tiposDocumento = [...d];
      this.cdr.detectChanges();
    });
  }

  guardar() {
    if (!this.form.nombre) return;
    if (this.editandoId) {
      this.svc.actualizarTipoDocumento(this.editandoId, this.form).subscribe(updated => {
        this.tiposDocumento = this.tiposDocumento.map(t => t.id === updated.id ? updated : t);
        this.cancelarEdicion();
      });
    } else {
      this.svc.crearTipoDocumento(this.form).subscribe(nuevo => {
        this.tiposDocumento.push(nuevo);
        this.form = this.formVacio();
      });
    }
  }

  editar(t: TipoDocumento) {
    this.editandoId = t.id!;
    this.form = { ...t };
  }

  eliminar(id: number) {
    if (confirm('¿Quitar este tipo de documento?')) {
      this.svc.eliminarTipoDocumento(id).subscribe(() => {
        this.tiposDocumento = this.tiposDocumento.filter(t => t.id !== id);
      });
    }
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.form = this.formVacio();
  }

  getCatColor(cat: string): string {
    const map: any = { LABORAL: '#3b82f6', LEGAL: '#8b5cf6', CONTABLE: '#22c55e', MEDICO: '#f59e0b', OTRO: '#6b7280' };
    return map[cat] || '#6b7280';
  }

  formVacio(): TipoDocumento {
    return { nombre: '', descripcion: '', categoria: 'LEGAL', obligatorio: false, activo: true };
  }
}
