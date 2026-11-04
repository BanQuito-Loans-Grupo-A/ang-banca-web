import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ApiBanquito, Cargando, CargoMoraCuota, ChipEstado, CuotaTabla, DineroPipe, EtiquetaPipe, FechaPipe,
  Icono, OperacionDetalle, PagoAplicado, TasaPipe, Vacio,
} from 'shared';
import { mensajeCliente } from '../mensajes';

type Pestana = 'tabla' | 'pagos' | 'mora';

@Component({
  selector: 'bw-operacion-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icono, Cargando, Vacio, ChipEstado, DineroPipe, FechaPipe, TasaPipe, EtiquetaPipe],
  templateUrl: './operacion-detalle.html',
  styleUrl: './operacion-detalle.css',
})
export class OperacionDetallePagina {
  private readonly api = inject(ApiBanquito);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly operacion = signal<OperacionDetalle | null>(null);
  protected readonly cuotas = signal<CuotaTabla[]>([]);
  protected readonly pagos = signal<PagoAplicado[]>([]);
  protected readonly mora = signal<CargoMoraCuota[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly pestana = signal<Pestana>('tabla');

  protected readonly tieneMora = computed(
    () => (this.operacion()?.diaMora ?? 0) > 0 || this.mora().some((cargo) => cargo.moraPendiente > 0),
  );

  protected readonly pestanas = computed<Array<{ id: Pestana; texto: string }>>(() => [
    { id: 'tabla', texto: 'Tabla de amortización' },
    { id: 'pagos', texto: 'Pagos aplicados' },
    ...(this.tieneMora() ? [{ id: 'mora' as Pestana, texto: 'Cargos de mora' }] : []),
  ]);

  protected readonly pestanaVisible = computed<Pestana>(() =>
    this.pestanas().some((item) => item.id === this.pestana()) ? this.pestana() : 'tabla',
  );

  constructor() {
    const numero = this.ruta.snapshot.paramMap.get('numero') ?? '';
    this.api.detalleOperacion(numero).subscribe({
      next: (valor) => {
        this.operacion.set(valor);
        this.cargando.set(false);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeCliente(fallo, 'No pudimos mostrar este préstamo. Intente de nuevo en unos minutos.'));
        this.cargando.set(false);
      },
    });
    this.api.tablaAmortizacion(numero).subscribe((valor) => this.cuotas.set(valor));
    this.api.pagosDeOperacion(numero, 0).subscribe((pagina) => this.pagos.set(pagina.content));
    this.api.cargosMora(numero).subscribe((valor) => this.mora.set(valor.filter((cargo) => cargo.moraAcumulada > 0)));
  }

  protected seleccionar(id: Pestana): void {
    this.pestana.set(id);
  }
}
