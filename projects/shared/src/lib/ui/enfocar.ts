import { Directive, ElementRef, Injector, afterNextRender, effect, inject, input } from '@angular/core';

@Directive({
  selector: '[bqEnfocar]',
  host: { tabindex: '-1', class: 'bq-enfocable' },
})
export class Enfocar {
  readonly bqEnfocar = input<unknown>(true);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  constructor() {
    effect(() => {
      const disparador = this.bqEnfocar();
      if (disparador === false || disparador === null || disparador === undefined || disparador === 0 || disparador === '') {
        return;
      }
      afterNextRender(() => this.enfocar(), { injector: this.injector });
    });
  }

  private enfocar(): void {
    const elemento = this.elemento.nativeElement;
    const reducir = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    elemento.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' });
    elemento.focus({ preventScroll: true });
    elemento.classList.remove('bq-resaltar');
    void elemento.offsetWidth;
    elemento.classList.add('bq-resaltar');
  }
}
