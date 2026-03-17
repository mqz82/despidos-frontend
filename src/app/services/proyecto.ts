import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Proyecto {
  id?: number;
  nombreExpediente: string;
  estado: string;
  nombreEmpleado: string;
  apellidoEmpleado: string;
  legajo?: string;
  areaDepartamento?: string;
  cargo?: string;
  fechaIngreso?: string;
  fechaDespido?: string;
  tipoDespido?: string;
  montoIndemnizacion?: number;
  dniEmpleado?: string;
  emailEmpleado?: string;
  fechaAudiencia: string;
  juzgado?: string;
  numeroCausa?: string;
  abogadoEmpresa?: string;
  abogadoEmpleado?: string;
  notas?: string;
  diasAnticipacionAlerta?: number;
  emailAlerta?: string;
  documentos?: DocumentoProyecto[];
}

export interface DocumentoProyecto {
  id?: number;
  tipoDocumento: { id: number; nombre: string };
  estado: string;
  obligatorio: boolean;
  fechaRecepcion?: string;
  responsable?: string;
  notas?: string;
}

export interface TipoDocumento {
  id?: number;
  nombre: string;
  descripcion?: string;
  obligatorio: boolean;
  categoria: string;
  activo?: boolean;
  orden?: number;
}

@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // PROYECTOS
  getProyectos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.baseUrl}/proyectos`);
  }

  getProyecto(id: number): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.baseUrl}/proyectos/${id}`);
  }

  crearProyecto(p: Proyecto): Observable<Proyecto> {
    return this.http.post<Proyecto>(`${this.baseUrl}/proyectos`, p);
  }

  actualizarProyecto(id: number, p: Proyecto): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.baseUrl}/proyectos/${id}`, p);
  }

  eliminarProyecto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/proyectos/${id}`);
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/proyectos/dashboard`);
  }

  getProximasAudiencias(dias: number = 60): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.baseUrl}/proyectos/proximos?dias=${dias}`);
  }

  buscar(termino: string): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.baseUrl}/proyectos/buscar?q=${termino}`);
  }

  // DOCUMENTOS
  actualizarDocumento(docId: number, doc: DocumentoProyecto): Observable<DocumentoProyecto> {
    return this.http.put<DocumentoProyecto>(`${this.baseUrl}/proyectos/documentos/${docId}`, doc);
  }

  getDocumentosFaltantes(proyectoId: number): Observable<DocumentoProyecto[]> {
    return this.http.get<DocumentoProyecto[]>(
      `${this.baseUrl}/proyectos/${proyectoId}/documentos/faltantes`,
    );
  }

  // TIPOS DOCUMENTO
  getTiposDocumento(): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(`${this.baseUrl}/tipos-documento`);
  }

  crearTipoDocumento(t: TipoDocumento): Observable<TipoDocumento> {
    return this.http.post<TipoDocumento>(`${this.baseUrl}/tipos-documento`, t);
  }

  // CONFIGURACION
  getConfiguracion(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/configuracion`);
  }

  guardarConfiguracion(config: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/configuracion`, config);
  }

  ejecutarAlertas(): Observable<any> {
    return this.http.post(`${this.baseUrl}/configuracion/alertas/ejecutar`, {});
  }

  actualizarTipoDocumento(id: number, t: TipoDocumento): Observable<TipoDocumento> {
    return this.http.put<TipoDocumento>(`${this.baseUrl}/tipos-documento/${id}`, t);
  }

  eliminarTipoDocumento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tipos-documento/${id}`);
  }
}
