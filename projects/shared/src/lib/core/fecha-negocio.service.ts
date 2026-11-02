import { Injectable, inject, signal } from '@angular/core';
import { ApiBanquito } from '../datos/api';
import { FechaNegocio } from './modelos';

@Injectable({ providedIn: 'root' })
export class FechaNegocioService {
  private readonly api = inject(ApiBanquito);
  readonly estado = signal<FechaNegocio | null>(null);

  cargar(): void {
    this.api.fechaNegocio().subscribe({
      next: (valor) => this.estado.set(valor),
      error: () => this.estado.set(null),
    });
  }
}
