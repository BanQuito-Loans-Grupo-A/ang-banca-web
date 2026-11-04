import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EtiquetaPipe } from '../pipes/etiqueta.pipe';

const TONOS: Record<string, string> = {
  POR_VENCER: 'exito',
  PAGADA: 'exito',
  LIQUIDADA: 'exito',
  CERRADO: 'exito',
  EXITOSA: 'exito',
  APROBADA: 'exito',
  APLICADA: 'exito',
  PROCESADO: 'exito',
  VENCIDA: 'alerta',
  PAGO_PARCIAL: 'alerta',
  EN_CIERRE: 'alerta',
  EN_PROCESO: 'alerta',
  REGISTRADA: 'marca',
  ABIERTO: 'marca',
  DESEMBOLSADA: 'marca',
  EN_LITIGIO: 'error',
  CASTIGADA: 'error',
  RECHAZADA: 'error',
  FALLIDO: 'error',
  FALLIDA: 'error',
  RECHAZADO: 'error',
};

@Component({
  selector: 'bq-chip-estado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EtiquetaPipe],
  template: `<span class="bq-chip" [class]="clase()">{{ estado() | etiqueta }}</span>`,
  styles: `:host { display: inline-flex; }`,
})
export class ChipEstado {
  readonly estado = input.required<string>();
  protected readonly clase = computed(() => {
    const tono = TONOS[this.estado()];
    return tono ? `bq-chip--${tono}` : '';
  });
}
