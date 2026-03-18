import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RutService {
  // Formatea el RUT mientras se escribe → 12.345.678-9
  formatear(rut: string): string {
    // Limpiar todo excepto números y K
    let valor = rut.replace(/[^0-9kK]/g, '').toUpperCase();

    if (valor.length === 0) return '';

    // Separar cuerpo y dígito verificador
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1);

    // Formatear cuerpo con puntos
    let cuerpoFormateado = '';
    while (cuerpo.length > 3) {
      cuerpoFormateado = '.' + cuerpo.slice(-3) + cuerpoFormateado;
      cuerpo = cuerpo.slice(0, -3);
    }
    cuerpoFormateado = cuerpo + cuerpoFormateado;

    return cuerpoFormateado + '-' + dv;
  }

  // Valida si el RUT es correcto usando Módulo 11
  validar(rut: string): boolean {
    if (!rut || rut.trim().length === 0) return true; // vacío es válido (campo opcional)

    // Limpiar el RUT
    const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();

    if (rutLimpio.length < 2) return false;

    const cuerpo = rutLimpio.slice(0, -1);
    const dvIngresado = rutLimpio.slice(-1);

    // Calcular dígito verificador
    const dvCalculado = this.calcularDV(cuerpo);

    return dvIngresado === dvCalculado;
  }

  // Algoritmo Módulo 11
  private calcularDV(cuerpo: string): string {
    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const resto = suma % 11;
    const dv = 11 - resto;

    if (dv === 11) return '0';
    if (dv === 10) return 'K';
    return dv.toString();
  }
}
