import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  ApiBanquito, Cargando, ChipEstado, DineroPipe, EtiquetaPipe, FechaPipe, Icono, SesionService,
  SolicitudCliente, TasaPipe, Vacio,
} from 'shared';
import { mensajeCliente, motivoParaCliente } from '../mensajes';

@Component({
  selector: 'bw-mis-solicitudes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icono, Cargando, Vacio, ChipEstado, DineroPipe, FechaPipe, TasaPipe, EtiquetaPipe],
  templateUrl: './mis-solicitudes.html',
  styleUrl: './listado.css',
})
export class MisSolicitudes {
  private readonly api = inject(ApiBanquito);
  protected readonly sesion = inject(SesionService);

  protected readonly solicitudes = signal<SolicitudCliente[]>([]);
  protected readonly cargando = signal(false);
  protected readonly consultado = signal(false);
  protected readonly error = signal('');
  protected readonly motivo = motivoParaCliente;


  protected identificacion(): string {
    return this.sesion.sesion()?.identificacion ?? '';
  }

  constructor() {
    this.consultar();
  }

  protected consultar(): void {
    this.cargando.set(true);
    this.api.solicitudesDelCliente(this.identificacion(), 0).subscribe({
      next: (pagina) => {
        this.solicitudes.set(pagina.content);
        this.cargando.set(false);
        this.consultado.set(true);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeCliente(fallo, 'No pudimos mostrar sus solicitudes en este momento. Intente de nuevo en unos minutos.'));
        this.solicitudes.set([]);
        this.cargando.set(false);
        this.consultado.set(true);
      },
    });
  }
}
