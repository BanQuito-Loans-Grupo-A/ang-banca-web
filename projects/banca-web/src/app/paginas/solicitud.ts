import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ApiBanquito, CondicionesSimulador, CuentaCliente, DestinoCredito, DineroPipe, Enfocar, EtiquetaPipe, Icono, Rango, SesionService,
  SistemaAmortizacion, SolicitudRegistrada, TasaPipe,
} from 'shared';
import { mensajeCliente, motivoParaCliente, plazosDisponibles } from '../mensajes';

const SISTEMAS: SistemaAmortizacion[] = ['FRANCES', 'ALEMAN'];
const MAXIMO_MENSUAL = 999999.99;

function multiploDeSeis(control: AbstractControl): ValidationErrors | null {
  const valor = Number(control.value);
  return Number.isInteger(valor) && valor % 6 === 0 ? null : { multiploDeSeis: true };
}

@Component({
  selector: 'bw-solicitud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icono, DineroPipe, TasaPipe, EtiquetaPipe, Enfocar, Rango],
  templateUrl: './solicitud.html',
  styleUrl: './solicitud.css',
})
export class Solicitud {
  private readonly api = inject(ApiBanquito);
  private readonly fb = inject(FormBuilder);
  private readonly sesion = inject(SesionService);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly respuesta = signal<SolicitudRegistrada | null>(null);
  protected readonly cuentas = signal<CuentaCliente[]>([]);
  protected readonly cargandoCuentas = signal(true);
  protected readonly errorCuentas = signal('');
  protected readonly limites = signal<CondicionesSimulador | null>(null);
  protected readonly plazos = computed(() => plazosDisponibles(this.limites()?.plazoMinimo ?? 6, this.limites()?.plazoMaximo ?? 60));
  protected readonly motivo = motivoParaCliente;

  protected readonly destinos: DestinoCredito[] = ['BIENES_DURADEROS', 'SALUD', 'EDUCACION', 'VIAJE', 'OTRO'];
  protected readonly identificacion = this.sesion.sesion()?.identificacion ?? '';
  protected readonly nombreCliente = this.sesion.sesion()?.nombre ?? '';

  protected readonly maximoMensual = MAXIMO_MENSUAL;

  protected readonly formulario = this.fb.nonNullable.group({
    identificacion: [{ value: this.identificacion, disabled: true }, [Validators.required, Validators.pattern(/^\d{10}$/)]],
    numeroCuentaDesembolso: ['', [Validators.required, Validators.maxLength(20)]],
    montoSolicitado: [10000, [Validators.required, Validators.min(500), Validators.max(30000)]],
    plazoMes: [12, [Validators.required, Validators.min(6), Validators.max(60), multiploDeSeis]],
    sistemaAmortizacion: ['FRANCES' as SistemaAmortizacion, Validators.required],
    destino: ['BIENES_DURADEROS' as DestinoCredito, Validators.required],
    ingresoMensual: [3500, [Validators.required, Validators.min(0), Validators.max(MAXIMO_MENSUAL)]],
    gastoMensual: [1200, [Validators.required, Validators.min(0), Validators.max(MAXIMO_MENSUAL)]],
  });

  constructor() {
    this.tomarSimulacion();
    this.cargarCuentas();
    this.api.condicionesProducto().subscribe((condiciones) => this.aplicarLimites(condiciones));
  }

  private aplicarLimites(condiciones: CondicionesSimulador): void {
    this.limites.set(condiciones);
    const { montoSolicitado, plazoMes } = this.formulario.controls;
    montoSolicitado.setValidators([Validators.required, Validators.min(condiciones.montoMinimo), Validators.max(condiciones.montoMaximo)]);
    plazoMes.setValidators([Validators.required, Validators.min(condiciones.plazoMinimo), Validators.max(condiciones.plazoMaximo), multiploDeSeis]);
    if (plazoMes.value && !this.plazos().includes(plazoMes.value)) {
      plazoMes.setValue(this.plazos().includes(12) ? 12 : this.plazos()[0]);
    }
    montoSolicitado.updateValueAndValidity();
    plazoMes.updateValueAndValidity();
  }

  private tomarSimulacion(): void {
    const parametros = this.ruta.snapshot.queryParamMap;
    const monto = Number(parametros.get('monto'));
    const plazo = Number(parametros.get('plazo'));
    const sistema = parametros.get('sistema') as SistemaAmortizacion | null;
    if (!monto || !plazo || !sistema || !SISTEMAS.includes(sistema)) {
      return;
    }
    const { montoSolicitado, plazoMes, sistemaAmortizacion } = this.formulario.controls;
    montoSolicitado.setValue(monto);
    if (plazo % 6 === 0) {
      plazoMes.setValue(plazo);
    }
    sistemaAmortizacion.setValue(sistema);
  }

  private cargarCuentas(): void {
    if (!this.identificacion) {
      this.cargandoCuentas.set(false);
      return;
    }
    this.api.cuentasDelCliente(this.identificacion).subscribe({
      next: (valor) => {
        this.cuentas.set(valor);
        if (valor.length === 1) {
          this.formulario.controls.numeroCuentaDesembolso.setValue(valor[0].numeroCuenta);
        }
        this.cargandoCuentas.set(false);
      },
      error: (fallo) => {
        this.errorCuentas.set(mensajeCliente(fallo, 'No pudimos mostrar sus cuentas en este momento. Intente de nuevo en unos minutos.'));
        this.cargandoCuentas.set(false);
      },
    });
  }

  protected enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    this.api.registrarSolicitud(this.formulario.getRawValue()).subscribe({
      next: (valor) => {
        this.respuesta.set(valor);
        this.enviando.set(false);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeCliente(fallo, 'No pudimos registrar su solicitud. Intente de nuevo en unos minutos.'));
        this.enviando.set(false);
      },
    });
  }

  protected reiniciar(): void {
    this.respuesta.set(null);
  }

  protected invalido(nombre: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[nombre];
    return control.touched && control.invalid;
  }
}
