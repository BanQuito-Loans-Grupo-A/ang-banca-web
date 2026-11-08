import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ApiBanquito, Cargando, ChipEstado, CifraAnimada, CuentaConSaldo, DineroPipe, EtiquetaPipe, FechaPipe, Icono,
  MovimientoCuenta, SesionService, Vacio,
} from 'shared';
import { mensajeCliente } from '../mensajes';

@Component({
  selector: 'bw-mis-cuentas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icono, Cargando, Vacio, ChipEstado, CifraAnimada, DineroPipe, FechaPipe, EtiquetaPipe],
  templateUrl: './mis-cuentas.html',
  styleUrl: './mis-cuentas.css',
})
export class MisCuentas {
  private readonly api = inject(ApiBanquito);
  protected readonly sesion = inject(SesionService);

  protected readonly cuentas = signal<CuentaConSaldo[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  protected readonly seleccionada = signal<string | null>(null);
  protected readonly movimientos = signal<MovimientoCuenta[]>([]);
  protected readonly cargandoMovimientos = signal(false);
  protected readonly errorMovimientos = signal('');
  protected readonly pagina = signal(0);
  protected readonly totalPaginas = signal(1);
  protected readonly totalMovimientos = signal(0);

  protected readonly saldoTotal = computed(() =>
    this.cuentas()
      .filter((cuenta) => cuenta.estado === 'ACTIVA')
      .reduce((total, cuenta) => Math.round((total + cuenta.saldo) * 100) / 100, 0),
  );

  protected readonly cuentasActivas = computed(() => this.cuentas().filter((cuenta) => cuenta.estado === 'ACTIVA').length);

  protected readonly cuentaActual = computed(
    () => this.cuentas().find((cuenta) => cuenta.numeroCuenta === this.seleccionada()) ?? null,
  );

  protected readonly nombre = computed(() => this.sesion.sesion()?.nombre.split(' ')[0] ?? '');

  constructor() {
    this.consultarCuentas();
  }

  protected consultarCuentas(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api.saldosDelCliente(this.identificacion()).subscribe({
      next: (cuentas) => {
        this.cuentas.set(cuentas);
        this.cargando.set(false);
        const inicial = cuentas.find((cuenta) => cuenta.estado === 'ACTIVA') ?? cuentas[0];
        if (inicial) {
          this.seleccionar(inicial.numeroCuenta);
        }
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeCliente(fallo, 'No pudimos mostrar sus cuentas en este momento. Intente de nuevo en unos minutos.'));
        this.cuentas.set([]);
        this.cargando.set(false);
      },
    });
  }

  protected seleccionar(numeroCuenta: string): void {
    if (this.seleccionada() === numeroCuenta && this.movimientos().length) {
      return;
    }
    this.seleccionada.set(numeroCuenta);
    this.consultarMovimientos(0);
  }

  protected irAPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas() || this.cargandoMovimientos()) {
      return;
    }
    this.consultarMovimientos(pagina);
  }

  protected nombreCuenta(tipoCuenta: string): string {
    return tipoCuenta === 'AHORROS' ? 'Cuenta de ahorros' : tipoCuenta === 'CORRIENTE' ? 'Cuenta corriente' : `Cuenta ${tipoCuenta.toLowerCase()}`;
  }

  protected terminacion(numeroCuenta: string): string {
    return `•••• ${numeroCuenta.slice(-4)}`;
  }

  protected hora(fechaHora: string): string {
    return fechaHora.length >= 16 ? fechaHora.slice(11, 16) : '';
  }

  private consultarMovimientos(pagina: number): void {
    const numeroCuenta = this.seleccionada();
    if (!numeroCuenta) {
      return;
    }
    this.cargandoMovimientos.set(true);
    this.errorMovimientos.set('');
    this.api.movimientosCuenta(this.identificacion(), numeroCuenta, pagina).subscribe({
      next: (respuesta) => {
        if (this.seleccionada() !== numeroCuenta) {
          return;
        }
        this.movimientos.set(respuesta.content);
        this.pagina.set(respuesta.page.number);
        this.totalPaginas.set(Math.max(1, respuesta.page.totalPages));
        this.totalMovimientos.set(respuesta.page.totalElements);
        this.cargandoMovimientos.set(false);
      },
      error: (fallo: unknown) => {
        if (this.seleccionada() !== numeroCuenta) {
          return;
        }
        this.errorMovimientos.set(mensajeCliente(fallo, 'No pudimos mostrar los movimientos de esta cuenta. Intente de nuevo en unos minutos.'));
        this.movimientos.set([]);
        this.cargandoMovimientos.set(false);
      },
    });
  }

  private identificacion(): string {
    return this.sesion.sesion()?.identificacion ?? '';
  }
}
