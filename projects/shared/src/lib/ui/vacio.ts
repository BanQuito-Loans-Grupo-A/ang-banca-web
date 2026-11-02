import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icono } from './icono';
import { NombreIcono } from './iconos';

@Component({
  selector: 'bq-vacio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icono],
  template: `
    <div class="vacio bq-animar">
      <span class="vacio__marco"><bq-icono [nombre]="icono()" [tamano]="26" /></span>
      <p class="vacio__titulo">{{ titulo() }}</p>
      @if (detalle()) {
        <p class="vacio__detalle">{{ detalle() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: `
    .vacio {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--bq-esp-2);
      padding: var(--bq-esp-7) var(--bq-esp-4);
      text-align: center;
      color: var(--bq-texto-suave);
    }

    .vacio__marco {
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--bq-marca-suave);
      color: var(--bq-marca);
      margin-bottom: var(--bq-esp-2);
    }

    .vacio__titulo {
      margin: 0;
      font-weight: 650;
      color: var(--bq-texto);
    }

    .vacio__detalle {
      margin: 0;
      max-width: 44ch;
      font-size: 0.9375rem;
    }
  `,
})
export class Vacio {
  readonly titulo = input.required<string>();
  readonly detalle = input('');
  readonly icono = input<NombreIcono>('capas');
}
