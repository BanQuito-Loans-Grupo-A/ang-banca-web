import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ApiBanquito,
  Cargando,
  CifraAnimada,
  CondicionesSimulador,
  DineroPipe,
  Enfocar,
  FechaPipe,
  Icono,
  Rango,
  Simulacion,
  SistemaAmortizacion,
  TasaPipe,
  sumar,
} from 'shared';
import { mensajeCliente, plazosDisponibles } from '../mensajes';

@Component({
  selector: 'bw-simulador',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icono, Cargando, CifraAnimada, Enfocar, Rango, DineroPipe, FechaPipe, TasaPipe],
  templateUrl: './simulador.html',
  styleUrl: './simulador.css',
})
export class Simulador {
  private readonly api = inject(ApiBanquito);
  private readonly fb = inject(FormBuilder);

  protected readonly condiciones = signal<CondicionesSimulador | null>(null);
  protected readonly resultado = signal<Simulacion | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly mostrarTabla = signal(false);
  protected readonly simulaciones = signal(0);
  protected readonly aperturasTabla = signal(0);

  protected readonly limites = computed(() => {
    const datos = this.condiciones();
    return {
      montoMinimo: datos?.montoMinimo ?? 500,
      montoMaximo: datos?.montoMaximo ?? 30000,
      plazoMinimo: datos?.plazoMinimo ?? 6,
      plazoMaximo: datos?.plazoMaximo ?? 60,
    };
  });

  protected readonly plazos = computed(() => plazosDisponibles(this.limites().plazoMinimo, this.limites().plazoMaximo));

  protected readonly formulario = this.fb.nonNullable.group({
    monto: [10000, [Validators.required, Validators.min(500), Validators.max(30000)]],
    plazoMeses: [12, [Validators.required, Validators.min(6), Validators.max(60)]],
    sistemaAmortizacion: ['FRANCES' as SistemaAmortizacion, Validators.required],
  });

  constructor() {
    this.api.condicionesProducto().subscribe((valor) => {
      this.condiciones.set(valor);
      const { monto, plazoMeses } = this.formulario.controls;
      monto.setValidators([Validators.required, Validators.min(valor.montoMinimo), Validators.max(valor.montoMaximo)]);
      plazoMeses.setValidators([Validators.required, Validators.min(valor.plazoMinimo), Validators.max(valor.plazoMaximo)]);
      monto.updateValueAndValidity();
      plazoMeses.updateValueAndValidity();
    });
    this.simular();
  }

  protected simular(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.api.simular(this.formulario.getRawValue()).subscribe({
      next: (valor) => {
        this.resultado.set(valor);
        this.simulaciones.update((total) => total + 1);
        this.cargando.set(false);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeCliente(fallo, 'No pudimos calcular su simulación. Intente de nuevo en unos minutos.'));
        this.resultado.set(null);
        this.cargando.set(false);
      },
    });
  }

  protected totalPagar(simulacion: Simulacion): number {
    return sumar(simulacion.monto, simulacion.totalIntereses, simulacion.totalSeguros);
  }

  protected alternarTabla(): void {
    this.mostrarTabla.update((valor) => !valor);
    if (this.mostrarTabla()) {
      this.aperturasTabla.update((total) => total + 1);
    }
  }

  protected get monto() {
    return this.formulario.controls.monto;
  }

  protected get plazo() {
    return this.formulario.controls.plazoMeses;
  }
}
