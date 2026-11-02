import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICONOS, NombreIcono } from './iconos';

@Component({
  selector: 'bq-icono',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="tamano()"
      [attr.height]="tamano()"
      [attr.viewBox]="caja()"
      fill="currentColor"
      [attr.aria-hidden]="etiqueta() ? null : 'true'"
      [attr.role]="etiqueta() ? 'img' : null"
      [attr.aria-label]="etiqueta() || null"
      focusable="false"
    >
      @for (trazo of trazos(); track $index) {
        <path [attr.d]="trazo" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: 0 0 auto;
      line-height: 0;
    }
  `,
})
export class Icono {
  readonly nombre = input.required<NombreIcono>();
  readonly tamano = input(20);
  readonly etiqueta = input('');

  private readonly definicion = computed(() => ICONOS[this.nombre()].icon);
  protected readonly caja = computed(() => `0 0 ${this.definicion()[0]} ${this.definicion()[1]}`);
  protected readonly trazos = computed(() => {
    const datos = this.definicion()[4];
    return Array.isArray(datos) ? datos : [datos];
  });
}
