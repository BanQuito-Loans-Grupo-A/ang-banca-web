import { Pipe, PipeTransform } from '@angular/core';
import { formatearFecha, formatearFechaLarga } from '../core/fechas';

@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
  transform(valor: string | null | undefined, formato: 'corta' | 'larga' = 'corta'): string {
    if (!valor) {
      return '—';
    }
    const soloFecha = valor.slice(0, 10);
    return formato === 'larga' ? formatearFechaLarga(soloFecha) : formatearFecha(soloFecha);
  }
}
