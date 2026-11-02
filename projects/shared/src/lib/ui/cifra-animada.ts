import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, effect, inject, input, signal, untracked } from '@angular/core';

const MONEDA = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DURACION_MS = 650;

@Component({
  selector: 'bq-cifra',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span aria-hidden="true">{{ texto() }}</span><span class="bq-solo-lectores">{{ textoFinal() }}</span>`,
  host: { class: 'bq-cifra' },
})
export class CifraAnimada {
  readonly valor = input.required<number | null | undefined>();

  protected readonly texto = signal('—');
  protected readonly textoFinal = signal('—');

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private anterior: number | null = null;
  private cuadro = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.cuadro));
    effect(() => {
      const destino = this.valor();
      untracked(() => this.animar(destino));
    });
  }

  private animar(destino: number | null | undefined): void {
    cancelAnimationFrame(this.cuadro);
    if (destino === null || destino === undefined || Number.isNaN(destino)) {
      this.texto.set('—');
      this.textoFinal.set('—');
      this.anterior = null;
      return;
    }
    this.textoFinal.set(MONEDA.format(destino));
    const origen = this.anterior;
    this.anterior = destino;
    const reducir = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (origen === null || origen === destino || reducir) {
      this.texto.set(MONEDA.format(destino));
      if (origen !== null && origen !== destino) {
        this.destellar(destino > origen);
      }
      return;
    }
    this.destellar(destino > origen);
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const avance = Math.min(1, (ahora - inicio) / DURACION_MS);
      const suave = 1 - Math.pow(1 - avance, 3);
      this.texto.set(MONEDA.format(origen + (destino - origen) * suave));
      if (avance < 1) {
        this.cuadro = requestAnimationFrame(paso);
      } else {
        this.texto.set(MONEDA.format(destino));
      }
    };
    this.cuadro = requestAnimationFrame(paso);
  }

  private destellar(sube: boolean): void {
    const elemento = this.elemento.nativeElement;
    elemento.classList.remove('bq-cifra--sube', 'bq-cifra--baja');
    void elemento.offsetWidth;
    elemento.classList.add(sube ? 'bq-cifra--sube' : 'bq-cifra--baja');
  }
}
