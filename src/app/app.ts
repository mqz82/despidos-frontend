import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <nav class="sidebar">
        <div class="sidebar-header">
          <div class="logo-sub">Sistema</div>
          <div class="logo-title">Despidos</div>
          <div class="logo-tag">GESTIÓN LEGAL</div>
        </div>
        <ul class="nav-menu">
          <li><a routerLink="/dashboard" routerLinkActive="active">◈ Dashboard</a></li>
          <li><a routerLink="/expedientes" routerLinkActive="active">⚖ Expedientes</a></li>
          <li><a routerLink="/documentos" routerLinkActive="active">📋 Documentos</a></li>
          <li><a routerLink="/configuracion" routerLinkActive="active">⚙ Configuración</a></li>
          <li><a routerLink="/archivos" routerLinkActive="active">📎 Archivos</a></li>
          <li><a routerLink="/abogados" routerLinkActive="active">📎 Abogados</a></li>
          <li><a routerLink="/funcionarios" routerLinkActive="active">📎 Funcionarios</a></li>
        </ul>
        <div class="sidebar-footer">v1.0.0 · Spring Boot + Angular</div>
      </nav>
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;500&family=IBM+Plex+Mono:wght@400;600&display=swap');

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .app-layout {
        display: flex;
        min-height: 100vh;
        background: #0c0e14;
        color: #e8e0d4;
        font-family: 'Crimson Pro', serif;
      }
      .sidebar {
        width: 240px;
        background: #111318;
        border-right: 1px solid #1e2130;
        display: flex;
        flex-direction: column;
        position: fixed;
        height: 100vh;
      }
      .sidebar-header {
        padding: 28px 20px 20px;
        border-bottom: 1px solid #1e2130;
      }
      .logo-sub {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #8b7355;
        text-transform: uppercase;
        font-family: 'IBM Plex Mono', monospace;
      }
      .logo-title {
        font-size: 22px;
        color: #e8e0d4;
        font-weight: 300;
        margin-top: 4px;
      }
      .logo-tag {
        font-size: 10px;
        color: #3a3830;
        font-family: 'IBM Plex Mono', monospace;
        margin-top: 6px;
        letter-spacing: 1px;
      }

      .nav-menu {
        list-style: none;
        padding: 16px 0;
        flex: 1;
      }
      .nav-menu li a {
        display: block;
        padding: 10px 20px;
        color: #7a7669;
        text-decoration: none;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 13px;
        letter-spacing: 0.5px;
        border-left: 2px solid transparent;
        transition: all 0.15s;
      }
      .nav-menu li a:hover {
        color: #e8e0d4;
        background: rgba(255, 255, 255, 0.03);
      }
      .nav-menu li a.active {
        color: #d4a853;
        background: rgba(212, 168, 83, 0.08);
        border-left-color: #d4a853;
      }

      .sidebar-footer {
        padding: 16px 20px;
        border-top: 1px solid #1e2130;
        font-size: 10px;
        color: #2e2c28;
        font-family: 'IBM Plex Mono', monospace;
      }

      .main-content {
        margin-left: 240px;
        padding: 32px 40px;
        min-height: 100vh;
        width: calc(100% - 240px);
      }
    `,
  ],
})
export class AppComponent {}
