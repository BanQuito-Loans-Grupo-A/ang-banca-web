import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ICONOS, NombreIcono } from './iconos';

@Component({
  selector: 'bq-icono',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="tamano()"
      [attr.height]="tamano()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="grosor()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-hidden]="etiqueta() ? null : 'true'"
      [attr.role]="etiqueta() ? 'img' : null"
      [attr.aria-label]="etiqueta() || null"
      focusable="false"
    >
      <path [attr.d]="trazo()" />
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
  readonly grosor = input(1.8);
  readonly etiqueta = input('');

  protected trazo(): string {
    return ICONOS[this.nombre()];
  }
}
