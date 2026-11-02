import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Logo } from './logo';

@Component({
  selector: 'bq-pie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Logo],
  template: `
    <footer class="pie">
      <div class="bq-contenedor">
        <p class="pie__frase">
          Si es de Quito, es de confianza.
          <span>Si es de préstamos, es <strong>BanQuito</strong>.</span>
        </p>

        <div class="pie__base">
          <div class="pie__marca">
            <bq-logo [alto]="36" />
            <p class="pie__lema">Para el chulla moderno: su BanQuito.</p>
          </div>
          <p class="pie__legal">
            Banco BanQuito S.A.
            <span aria-hidden="true">·</span>
            Core de Préstamos de Consumo
            <span aria-hidden="true">·</span>
            Ecuador
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .pie {
      margin-top: var(--bq-esp-7);
      border-top: 1px solid var(--bq-borde);
      padding-block: var(--bq-esp-6) var(--bq-esp-5);
    }

    .pie__frase {
      display: flex;
      flex-wrap: wrap;
      column-gap: 0.4em;
      margin: 0 0 var(--bq-esp-5);
      font-size: clamp(1.125rem, 1rem + 0.6vw, 1.375rem);
      font-weight: 600;
      line-height: 1.35;
      color: var(--bq-texto);
    }

    .pie__frase strong {
      color: var(--bq-marca);
    }

    .pie__base {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--bq-esp-4);
      flex-wrap: wrap;
      padding-top: var(--bq-esp-4);
      border-top: 1px solid var(--bq-borde);
    }

    .pie__marca {
      display: flex;
      align-items: center;
      gap: var(--bq-esp-5);
      flex-wrap: wrap;
    }

    .pie__lema {
      margin: 0;
      padding-left: var(--bq-esp-5);
      border-left: 1px solid var(--bq-borde-fuerte);
      font-style: italic;
      color: var(--bq-texto-suave);
    }

    .pie__legal {
      display: flex;
      flex-wrap: wrap;
      gap: var(--bq-esp-2);
      margin: 0;
      font-size: 0.8125rem;
      color: var(--bq-texto-tenue);
    }
  `,
})
export class Pie {}
