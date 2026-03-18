import { Injectable, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { ToastComponent } from './toast/toast';

@Injectable({ providedIn: 'root' })
export class ToastService {

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  mostrar(mensaje: string, tipo: 'success' | 'error' | 'warn' = 'success', duracion = 3000) {
    // Crear el componente dinámicamente
    const ref: ComponentRef<ToastComponent> = createComponent(ToastComponent, {
      environmentInjector: this.injector
    });

    // Pasar los inputs
    ref.instance.mensaje = mensaje;
    ref.instance.tipo = tipo;
    ref.instance.duracion = duracion;

    // Agregar al DOM
    this.appRef.attachView(ref.hostView);
    document.body.appendChild(ref.location.nativeElement);

    // Eliminar del DOM después de la duración
    setTimeout(() => {
      this.appRef.detachView(ref.hostView);
      ref.destroy();
    }, duracion + 500);
  }

  exito(mensaje: string)    { this.mostrar(mensaje, 'success'); }
  error(mensaje: string)    { this.mostrar(mensaje, 'error'); }
  advertencia(mensaje: string) { this.mostrar(mensaje, 'warn'); }
}

// ### ¿Qué hace este servicio?
// ```
// expedientes.ts llama →  toastSvc.exito('Guardado!')
//                                 ↓
//                     Crea ToastComponent dinámicamente
//                                 ↓
//                     Lo agrega al DOM (aparece en pantalla)
// ↓
//                     3.5 segundos después lo elimina del DOM
