import { Injectable, effect, signal } from '@angular/core';

export type Tema = 'claro' | 'oscuro';

const CLAVE = 'banquito-tema';

@Injectable({ providedIn: 'root' })
export class TemaService {
  readonly tema = signal<Tema>(this.inicial());

  constructor() {
    effect(() => {
      const valor = this.tema();
      document.documentElement.setAttribute('data-tema', valor);
      try {
        localStorage.setItem(CLAVE, valor);
      } catch {
        return;
      }
    });
  }

  alternar(): void {
    this.tema.update((actual) => (actual === 'claro' ? 'oscuro' : 'claro'));
  }

  private inicial(): Tema {
    try {
      const guardado = localStorage.getItem(CLAVE);
      if (guardado === 'claro' || guardado === 'oscuro') {
        return guardado;
      }
    } catch {
      return 'claro';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  }
}
