import { Directive, ElementRef, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';

const TECLAS_LIBRES = ['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];

function definido(valor: number | null | undefined): valor is number {
  return valor !== null && valor !== undefined && !Number.isNaN(valor);
}

@Directive({
  selector: 'input[bqRango]',
  host: {
    '(keydown)': 'alTeclear($event)',
    '(paste)': 'alPegar($event)',
    '(input)': 'alEscribir()',
  },
})
export class Rango {
  readonly bqMax = input<number | null | undefined>(null);
  readonly bqDecimales = input(2);

  private readonly elemento = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly control = inject(NgControl, { optional: true, self: true });

  protected alTeclear(evento: KeyboardEvent): void {
    if (evento.ctrlKey || evento.metaKey || evento.altKey || TECLAS_LIBRES.includes(evento.key)) {
      return;
    }
    const decimal = evento.key === '.' || evento.key === ',';
    if (/^\d$/.test(evento.key) || (decimal && this.bqDecimales() > 0)) {
      return;
    }
    evento.preventDefault();
  }

  protected alPegar(evento: ClipboardEvent): void {
    const texto = (evento.clipboardData?.getData('text') ?? '').trim();
    const patron = this.bqDecimales() > 0 ? /^\d+([.,]\d+)?$/ : /^\d+$/;
    if (!patron.test(texto)) {
      evento.preventDefault();
    }
  }

  protected alEscribir(): void {
    const texto = this.elemento.nativeElement.value;
    if (texto === '') {
      return;
    }
    let ajustado = texto;
    const [entero, fraccion] = texto.split('.');
    const decimales = this.bqDecimales();
    if (fraccion !== undefined && fraccion.length > decimales) {
      ajustado = decimales === 0 ? entero : `${entero}.${fraccion.slice(0, decimales)}`;
    }
    const maximo = this.bqMax();
    if (definido(maximo) && Number(ajustado) > maximo) {
      ajustado = String(maximo);
    }
    if (ajustado !== texto) {
      this.fijar(ajustado);
    }
  }

  private fijar(texto: string): void {
    this.elemento.nativeElement.value = texto;
    const control = this.control?.control;
    if (control) {
      control.setValue(Number(texto));
      control.markAsTouched();
    }
  }
}

@Directive({
  selector: 'input[bqSoloDigitos]',
  host: {
    '(input)': 'alEscribir()',
  },
})
export class SoloDigitos {
  private readonly elemento = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly control = inject(NgControl, { optional: true, self: true });

  protected alEscribir(): void {
    const elemento = this.elemento.nativeElement;
    const limpio = elemento.value.replace(/\D/g, '');
    if (limpio !== elemento.value) {
      elemento.value = limpio;
      this.control?.control?.setValue(limpio);
    }
  }
}
