import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Funcionario, ProyectoService } from '../../services/proyecto';
import { RutService } from '../../services/rut';
import { ToastService } from '../../shared/toast';


@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./funcionarios.scss'],
  template: `
    <div class="page-header">
      <h1 class="page-title">Funcionario</h1>
      <p class="page-sub">GESTIÓN DE FUNCIONARIO</p>
    </div>

    <!-- TOOLBAR -->
    <div class="toolbar">
      <input
        class="input-search"
        [(ngModel)]="busqueda"
        placeholder="Buscar por nombre o RUT..."
        (ngModelChange)="filtrar()"
      />
      <div class="spacer"></div>
      <button class="btn btn-primary" (click)="abrirFormNuevo()">+ Nuevo Funcionario</button>
    </div>

    <!-- LISTA -->
    <div class="card">
      <table class="tabla">
        <thead>
          <tr>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>RUT</th>
            <th>Cargo</th>
            <th>Departamento</th>
            <th>Institucion</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of funcionariosFiltrados">
            <td>{{ a.persona.nombres }}</td>
            <td>{{ a.persona.appPaterno }} {{ a.persona.appMaterno }}</td>
            <td>
              <span class="exp-num">{{ a.persona.rut }}</span>
            </td>
            <td>{{ a.cargo || '—' }}</td>
            <td>{{ a.departamento || '—' }}</td>
            <td>{{ a.institucion || '—' }}</td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-sm" (click)="editar(a)">Editar</button>
                <button class="btn btn-danger btn-sm" (click)="eliminar(a.id!)">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="funcionariosFiltrados.length === 0" class="empty">No se encontraron funcionario</div>
    </div>

    <!-- MODAL FORMULARIO -->
    <div class="modal-overlay" *ngIf="mostrarForm" (click)="cerrarForm()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 style="font-size:22px;font-weight:300">
              {{ editando ? 'Editar funcionario' : 'Nuevo funcionario' }}
            </h2>
            <p
              style="font-size:12px;color:#5a5650;font-family:'IBM Plex Mono',monospace;margin-top:4px"
            >
              DATOS DEL FUNCI0ONARIO
            </p>
          </div>
          <button class="btn btn-ghost" (click)="cerrarForm()">✕ Cerrar</button>
        </div>

        <div class="section-title gold">— Datos Personales</div>
        <div class="form-grid3">
          <div class="field">
            <label class="label">Nombres *</label>
            <input class="input" [(ngModel)]="form.persona.nombres" tabindex="1" />
          </div>
          <div class="field">
            <label class="label">Apellido Paterno *</label>
            <input class="input" [(ngModel)]="form.persona.appPaterno" tabindex="2" />
          </div>
          <div class="field">
            <label class="label">Apellido Materno</label>
            <input class="input" [(ngModel)]="form.persona.appMaterno" tabindex="3" />
          </div>
        </div>
        <div class="form-grid3" style="margin-top:14px">
          <div class="field">
            <label class="label">RUT</label>
            <input
              class="input"
              [ngModel]="form.persona.rut"
              (ngModelChange)="onRutChange($event)"
              placeholder="12.345.678-9"
              tabindex="4"
            />
            <span
              *ngIf="!rutValido"
              style="color:#ef4444;font-size:11px;font-family:'IBM Plex Mono',monospace"
            >
              ✗ RUT inválido
            </span>
          </div>
          <div class="field">
            <label class="label">Género</label>
            <select class="select" [(ngModel)]="form.persona.genero" tabindex="5">
              <option value="">-- Seleccionar --</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
              <option value="OTRO">Otro</option>
              <option value="PREFIERO_NO_DECIR">Prefiero no decir</option>
            </select>
          </div>
          <div class="field">
            <label class="label">Fecha Nacimiento</label>
            <input
              class="input"
              type="date"
              [(ngModel)]="form.persona.fechaNacimiento"
              tabindex="6"
            />
          </div>
        </div>

        <hr class="divider" />
        <div class="section-title gold">— Datos Profesionales</div>
        <div class="form-grid3">
          <div class="field">
            <label class="label">Cargo</label>
            <input class="input" [(ngModel)]="form.cargo" tabindex="7" />
          </div>
          <div class="field">
            <label class="label">Departamento</label>
            <input class="input" [(ngModel)]="form.departamento" tabindex="8" />
          </div>
          <div class="field">
            <label class="label">Institución</label>
            <input class="input" [(ngModel)]="form.institucion" tabindex="9" />
          </div>
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:28px">
          <button class="btn btn-ghost" (click)="cerrarForm()">Cancelar</button>
          <button class="btn btn-primary" (click)="guardar()">Guardar</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    //   .page-title {
    //     font-size: 28px;
    //     font-weight: 300;
    //     color: #e8e0d4;
    //   }
    //   .page-sub {
    //     font-size: 12px;
    //     color: #5a5650;
    //     font-family: 'IBM Plex Mono', monospace;
    //     margin-bottom: 32px;
    //     margin-top: 4px;
    //   }
    //   .toolbar {
    //     display: flex;
    //     gap: 12px;
    //     margin-bottom: 24px;
    //     align-items: center;
    //   }
    //   .spacer {
    //     flex: 1;
    //   }
    //   .input-search {
    //     background: #0c0e14;
    //     border: 1px solid #1e2130;
    //     border-radius: 2px;
    //     padding: 8px 12px;
    //     color: #e8e0d4;
    //     font-size: 14px;
    //     width: 360px;
    //     outline: none;
    //   }
    //   .card {
    //     background: #111318;
    //     border: 1px solid #1e2130;
    //     border-radius: 2px;
    //     padding: 24px;
    //   }
    //   .tabla {
    //     width: 100%;
    //     border-collapse: collapse;
    //   }
    //   .tabla th {
    //     text-align: left;
    //     padding: 10px 16px;
    //     font-size: 10px;
    //     letter-spacing: 2px;
    //     color: #5a5650;
    //     text-transform: uppercase;
    //     font-family: 'IBM Plex Mono', monospace;
    //     border-bottom: 1px solid #1e2130;
    //   }
    //   .tabla td {
    //     padding: 14px 16px;
    //     font-size: 14px;
    //     border-bottom: 1px solid #111318;
    //   }
    //   .tabla tr:hover td {
    //     background: rgba(255, 255, 255, 0.02);
    //   }
    //   .exp-num {
    //     font-family: 'IBM Plex Mono', monospace;
    //     font-size: 12px;
    //     color: #d4a853;
    //   }
    //   .btn {
    //     padding: 8px 20px;
    //     border: none;
    //     border-radius: 2px;
    //     cursor: pointer;
    //     font-size: 12px;
    //     font-family: 'IBM Plex Mono', monospace;
    //     letter-spacing: 1px;
    //     font-weight: 600;
    //     text-transform: uppercase;
    //     background: #1e2130;
    //     color: #e8e0d4;
    //     transition: all 0.15s;
    //   }
    //   .btn-primary {
    //     background: #d4a853;
    //     color: #0c0e14;
    //   }
    //   .btn-danger {
    //     background: #7f1d1d;
    //     color: #fca5a5;
    //   }
    //   .btn-ghost {
    //     background: transparent;
    //     color: #7a7669;
    //     border: 1px solid #1e2130;
    //   }
    //   .btn-sm {
    //     padding: 4px 10px;
    //     font-size: 11px;
    //   }
    //   .empty {
    //     text-align: center;
    //     padding: 40px;
    //     color: #3a3830;
    //     font-family: 'IBM Plex Mono', monospace;
    //   }
    //   .modal-overlay {
    //     position: fixed;
    //     inset: 0;
    //     background: rgba(0, 0, 0, 0.85);
    //     z-index: 1000;
    //     display: flex;
    //     align-items: flex-start;
    //     justify-content: center;
    //     padding: 40px 20px;
    //     overflow-y: auto;
    //   }
    //   .modal-content {
    //     background: #111318;
    //     border: 1px solid #1e2130;
    //     border-radius: 2px;
    //     width: 100%;
    //     max-width: 800px;
    //     padding: 36px;
    //   }
    //   .modal-header {
    //     display: flex;
    //     justify-content: space-between;
    //     align-items: flex-start;
    //     margin-bottom: 24px;
    //   }
    //   .section-title {
    //     font-size: 11px;
    //     letter-spacing: 2px;
    //     color: #5a5650;
    //     text-transform: uppercase;
    //     font-family: 'IBM Plex Mono', monospace;
    //     margin-bottom: 16px;
    //   }
    //   .section-title.gold {
    //     color: #d4a853;
    //   }
    //   .form-grid3 {
    //     display: grid;
    //     grid-template-columns: 1fr 1fr 1fr;
    //     gap: 20px;
    //   }
    //   .field {
    //   }
    //   .label {
    //     font-size: 11px;
    //     letter-spacing: 1.5px;
    //     color: #5a5650;
    //     text-transform: uppercase;
    //     font-family: 'IBM Plex Mono', monospace;
    //     display: block;
    //     margin-bottom: 6px;
    //   }
    //   .input {
    //     background: #0c0e14;
    //     border: 1px solid #1e2130;
    //     border-radius: 2px;
    //     padding: 8px 12px;
    //     color: #e8e0d4;
    //     font-size: 14px;
    //     font-family: 'Crimson Pro', serif;
    //     width: 100%;
    //     outline: none;
    //   }
    //   .select {
    //     background: #0c0e14;
    //     border: 1px solid #1e2130;
    //     border-radius: 2px;
    //     padding: 8px 12px;
    //     color: #e8e0d4;
    //     font-size: 14px;
    //     width: 100%;
    //     outline: none;
    //   }
    //   .divider {
    //     border: none;
    //     border-top: 1px solid #1e2130;
    //     margin: 24px 0;
    //   }
    // `,
  ],
})
export class FuncionariosComponent implements OnInit {
  funcionarios: Funcionario[] = [];
  funcionariosFiltrados: Funcionario[] = [];
  busqueda = '';
  mostrarForm = false;
  editando: Funcionario | null = null;
  rutValido = true;
  form: Funcionario = this.formVacio();

  constructor(
    private svc: ProyectoService,
    private rutSvc: RutService,
    private toastSvc: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.svc.getFuncionarios().subscribe((d) => {
      this.funcionarios = [...d];
      this.funcionariosFiltrados = [...d];
      this.cdr.detectChanges();
    });
  }

  filtrar() {
    const q = this.busqueda.toLowerCase();
    this.funcionariosFiltrados = this.funcionarios.filter((a) =>
      `${a.persona.nombres} ${a.persona.appPaterno} ${a.persona.rut}`.toLowerCase().includes(q),
    );
  }

  abrirFormNuevo() {
    this.editando = null;
    this.form = this.formVacio();
    this.mostrarForm = true;
  }

  editar(a: Funcionario) {
    this.editando = a;
    this.form = { ...a, persona: { ...a.persona } };
    this.mostrarForm = true;
  }

  guardar() {
    if (!this.form.persona.nombres) {
      this.toastSvc.advertencia('El nombre es obligatorio');
      return;
    }
    if (!this.form.persona.appPaterno) {
      this.toastSvc.advertencia('El apellido paterno es obligatorio');
      return;
    }
    if (!this.rutValido) {
      this.toastSvc.error('El RUT ingresado es inválido');
      return;
    }

    if (this.editando?.id) {
      this.svc.actualizarFuncionario(this.editando.id, this.form).subscribe({
        next: (updated) => {
          this.funcionarios = [...this.funcionarios.map((a) => (a.id === updated.id ? updated : a))];
          this.funcionariosFiltrados = [...this.funcionarios];
          this.mostrarForm = false;
          this.cdr.detectChanges();
          this.toastSvc.exito('Funcionario actualizado correctamente');
        },
        error: () => this.toastSvc.error('Error al actualizar el funcionario'),
      });
    } else {
      this.svc.crearFuncionario(this.form).subscribe({
        next: (nuevo) => {
          this.funcionarios = [...this.funcionarios, nuevo];
          this.funcionariosFiltrados = [...this.funcionarios];
          this.mostrarForm = false;
          this.cdr.detectChanges();
          this.toastSvc.exito('Funcionario creado correctamente');
        },
        error: () => this.toastSvc.error('Error al crear el funcionario'),
      });
    }
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar este funcionario?')) {
      this.svc.eliminarFuncionario(id).subscribe(() => {
        this.funcionarios = [...this.funcionarios.filter((a) => a.id !== id)];
        this.funcionariosFiltrados = [...this.funcionarios];
        this.cdr.detectChanges();
        this.toastSvc.exito('Funcinario eliminado correctamente');
      });
    }
  }

  cerrarForm() {
    this.mostrarForm = false;
    this.editando = null;
    this.form = this.formVacio();
  }

  onRutChange(valor: string) {
    this.form.persona.rut = this.rutSvc.formatear(valor);
    this.rutValido = this.rutSvc.validar(this.form.persona.rut || '');
  }

  formVacio(): Funcionario {
    return {
      persona: { nombres: '', appPaterno: '', appMaterno: '', rut: '', genero: '' },
      cargo: '',
      departamento: '',
      institucion: '',
    };
  }
}
