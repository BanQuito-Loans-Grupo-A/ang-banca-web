import { Pipe, PipeTransform } from '@angular/core';

const ETIQUETAS: Record<string, string> = {
  POR_VENCER: 'Por vencer',
  VENCIDA: 'Vencida',
  EN_LITIGIO: 'En litigio',
  CASTIGADA: 'Castigada',
  CANCELADA: 'Cancelada',
  REGISTRADA: 'Registrada',
  RECHAZADA: 'Rechazada',
  APROBADA: 'Aprobada',
  DESEMBOLSADA: 'Desembolsada',
  PENDIENTE: 'Pendiente',
  PAGO_PARCIAL: 'Pago parcial',
  PAGADA: 'Pagada',
  ANULADA: 'Anulada',
  LIQUIDADA: 'Liquidada',
  ABIERTO: 'Abierto',
  EN_CIERRE: 'En cierre',
  FALLIDO: 'Fallido',
  CERRADO: 'Cerrado',
  EN_PROCESO: 'En proceso',
  PROCESADO: 'Procesado',
  RECHAZADO: 'Rechazado',
  EXITOSA: 'Exitosa',
  FALLIDA: 'Fallida',
  FRANCES: 'Francés',
  ALEMAN: 'Alemán',
  BIENES_DURADEROS: 'Bienes duraderos',
  SALUD: 'Salud',
  EDUCACION: 'Educación',
  VIAJE: 'Viaje',
  OTRO: 'Otro',
  REDUCIR_CUOTA: 'Reducir la cuota',
  REDUCIR_PLAZO: 'Reducir el plazo',
  GENERADA: 'Generada',
  ENVIADA: 'Enviada',
  APLICADA: 'Aplicada',
  REFERENCIAL: 'Referencial',
  DEFINITIVA: 'Definitiva',
  AHORROS: 'Ahorros',
  CORRIENTE: 'Corriente',
  CUOTA: 'Cuota',
  ABONO_EXTRAORDINARIO: 'Abono extraordinario',
  CANCELACION_ANTICIPADA: 'Cancelación anticipada',
  SEGURO: 'Seguro',
  MORA: 'Mora',
  INTERES: 'Interés',
  CAPITAL: 'Capital',
};

@Pipe({ name: 'etiqueta' })
export class EtiquetaPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) {
      return '—';
    }
    return ETIQUETAS[valor] ?? valor;
  }
}
