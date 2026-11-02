import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Logo } from './logo';

@Component({
  selector: 'bq-pantalla-ingreso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Logo],
  template: `
    <div class="pantalla">
      <section class="marca bq-animar">
        <bq-logo [alto]="58" />
        <div class="marca__texto">
          <hr class="bq-regla" />
          <h1>{{ titulo() }}</h1>
          <p>{{ descripcion() }}</p>
        </div>
        <img
          class="marca__ilustracion bq-ilustracion"
          [src]="ilustracion()"
          alt=""
          width="900"
          height="485"
        />
        <p class="marca__lema">Para el chulla moderno: su BanQuito.</p>
      </section>

      <section class="acceso bq-animar" aria-labelledby="titulo-acceso">
        <div class="acceso__interior">
          <h2 id="titulo-acceso">{{ tituloFormulario() }}</h2>
          <ng-content />
        </div>
      </section>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      overflow: hidden;
      min-height: 100dvh;
      background: var(--bq-fondo);
    }

    :host::before,
    :host::after {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      border: 1.5px solid var(--bq-coral);
      border-radius: 50%;
      opacity: 0.8;
      pointer-events: none;
    }

    :host::before {
      top: -228px;
      right: -110px;
    }

    :host::after {
      bottom: -240px;
      left: -170px;
    }

    .pantalla {
      position: relative;
      z-index: 1;
      display: grid;
      gap: var(--bq-esp-6);
      width: 100%;
      max-width: var(--bq-ancho);
      min-height: 100dvh;
      margin-inline: auto;
      padding: var(--bq-esp-6) var(--bq-esp-5);
    }

    .marca {
      display: flex;
      flex-direction: column;
      gap: var(--bq-esp-5);
    }

    .marca__texto h1 {
      max-width: 14ch;
      margin-bottom: var(--bq-esp-4);
    }

    .marca__texto p {
      max-width: 44ch;
      margin: 0;
      font-size: 1.0625rem;
      color: var(--bq-texto-suave);
    }

    .marca__ilustracion {
      display: none;
      width: 100%;
      max-width: 520px;
      height: auto;
      margin-top: auto;
    }

    .marca__lema {
      display: none;
      margin: 0;
      font-style: italic;
      color: var(--bq-texto-tenue);
    }

    .acceso {
      display: flex;
      align-items: center;
    }

    .acceso__interior {
      width: 100%;
      max-width: 500px;
    }

    .acceso h2 {
      margin-bottom: var(--bq-esp-5);
      font-size: clamp(1.6rem, 1.3rem + 1vw, 2.1rem);
    }

    @media (min-width: 920px) {
      .pantalla {
        grid-template-columns: 1fr 1fr;
        gap: 0;
        padding-block: var(--bq-esp-6);
      }

      .marca {
        padding-right: var(--bq-esp-6);
        border-right: 1px solid var(--bq-borde);
      }

      .marca__ilustracion,
      .marca__lema {
        display: block;
      }

      .acceso {
        justify-content: center;
        padding-left: var(--bq-esp-6);
      }
    }
  `,
})
export class PantallaIngreso {
  readonly titulo = input.required<string>();
  readonly descripcion = input.required<string>();
  readonly tituloFormulario = input.required<string>();
  readonly ilustracion = input('img/ingreso.webp');
}
