import { Pipe, PipeTransform } from '@angular/core';

const FORMATO = new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

@Pipe({ name: 'tasa' })
export class TasaPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) {
      return '—';
    }
    return `${FORMATO.format(valor)} %`;
  }
}
