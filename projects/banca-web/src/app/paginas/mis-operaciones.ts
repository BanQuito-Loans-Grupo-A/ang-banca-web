import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ApiBanquito, Cargando, ChipEstado, DineroPipe, EtiquetaPipe, FechaPipe, Icono, OperacionCliente,
  SesionService, Vacio,
} from 'shared';

@Component({
  selector: 'bw-mis-operaciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icono, Cargando, Vacio, ChipEstado, DineroPipe, FechaPipe, EtiquetaPipe],
  templateUrl: './mis-operaciones.html',
  styleUrl: './listado.css',
})
export class MisOperaciones {
  private readonly api = inject(ApiBanquito);
  protected readonly sesion = inject(SesionService);

  protected readonly operaciones = signal<OperacionCliente[]>([]);
  protected readonly cargando = signal(false);
  protected readonly consultado = signal(false);


  protected identificacion(): string {
    return this.sesion.sesion()?.identificacion ?? '';
  }

  constructor() {
    this.consultar();
  }

  protected consultar(): void {
    this.cargando.set(true);
    this.api.operacionesDelCliente(this.identificacion(), 0).subscribe({
      next: (pagina) => {
        this.operaciones.set(pagina.content);
        this.cargando.set(false);
        this.consultado.set(true);
      },
      error: () => {
        this.operaciones.set([]);
        this.cargando.set(false);
        this.consultado.set(true);
      },
    });
  }
}
