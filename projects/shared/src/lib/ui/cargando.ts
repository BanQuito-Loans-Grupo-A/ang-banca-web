import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'bq-cargando',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cargando" role="status" aria-live="polite">
      <span class="bq-solo-lectores">{{ mensaje() }}</span>
      @for (linea of lineas(); track $index) {
        <span class="bq-esqueleto" [style.width.%]="linea" aria-hidden="true"></span>
      }
    </div>
  `,
  styles: `
    .cargando {
      display: flex;
      flex-direction: column;
      gap: var(--bq-esp-3);
    }

    .bq-esqueleto {
      height: 1.25rem;
      display: block;
    }
  `,
})
export class Cargando {
  readonly mensaje = input('Cargando información');
  readonly filas = input(3);

  protected lineas(): number[] {
    const anchos = [100, 82, 64, 91, 73];
    return Array.from({ length: this.filas() }, (unused, indice) => anchos[indice % anchos.length]);
  }
}
