import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'bq-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img class="logo logo--color" [src]="ruta()" alt="BanQuito" [style.height.px]="alto()" />
    <img
      class="logo logo--claro"
      [src]="rutaClara()"
      alt=""
      aria-hidden="true"
      [style.height.px]="alto()"
    />
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
    }

    .logo {
      width: auto;
      max-width: none;
    }

    .logo--claro {
      display: none;
    }

    :host-context([data-tema='oscuro']) .logo--color {
      display: none;
    }

    :host-context([data-tema='oscuro']) .logo--claro {
      display: block;
    }
  `,
})
export class Logo {
  readonly alto = input(44);
  readonly soloMarca = input(false);

  protected readonly ruta = computed(() =>
    this.soloMarca() ? 'img/logo-marca.webp' : 'img/logo.webp',
  );
  protected readonly rutaClara = computed(() =>
    this.soloMarca() ? 'img/logo-marca.webp' : 'img/logo-claro.webp',
  );
}
