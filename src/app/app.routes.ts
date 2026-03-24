import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ExpedientesComponent } from './pages/expedientes/expedientes';
import { DocumentosComponent } from './pages/documentos/documentos';
import { ConfiguracionComponent } from './pages/configuracion/configuracion';
import { ArchivosComponent } from './pages/archivos/archivos';
import { AbogadosComponent } from './pages/abogados/abogados';
import { FuncionariosComponent } from './pages/funcionarios/funcionarios';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'expedientes', component: ExpedientesComponent },
  { path: 'documentos', component: DocumentosComponent },
  { path: 'configuracion', component: ConfiguracionComponent },
  { path: 'archivos', component: ArchivosComponent },
  { path: 'abogados', component: AbogadosComponent },
  { path: 'funcionarios', component: FuncionariosComponent },
];
