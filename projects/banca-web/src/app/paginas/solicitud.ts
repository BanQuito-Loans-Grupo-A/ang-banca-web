import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ApiBanquito, DestinoCredito, DineroPipe, EtiquetaPipe, Icono, SesionService, SistemaAmortizacion,
  SolicitudRegistrada, TasaPipe,
} from 'shared';

@Component({
  selector: 'bw-solicitud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icono, DineroPipe, TasaPipe, EtiquetaPipe],
  templateUrl: './solicitud.html',
  styleUrl: './solicitud.css',
})
export class Solicitud {
  private readonly api = inject(ApiBanquito);
  private readonly fb = inject(FormBuilder);
  private readonly sesion = inject(SesionService);

  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly respuesta = signal<SolicitudRegistrada | null>(null);

  protected readonly destinos: DestinoCredito[] = ['BIENES_DURADEROS', 'SALUD', 'EDUCACION', 'VIAJE', 'OTRO'];

  protected readonly formulario = this.fb.nonNullable.group({
    identificacion: [this.sesion.sesion()?.identificacion ?? '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    numeroCuentaDesembolso: ['', [Validators.required, Validators.maxLength(20)]],
    montoSolicitado: [10000, [Validators.required, Validators.min(500), Validators.max(30000)]],
    plazoMes: [12, [Validators.required, Validators.min(6), Validators.max(60)]],
    sistemaAmortizacion: ['FRANCES' as SistemaAmortizacion, Validators.required],
    destino: ['BIENES_DURADEROS' as DestinoCredito, Validators.required],
    ingresoMensual: [3500, [Validators.required, Validators.min(0)]],
    gastoMensual: [1200, [Validators.required, Validators.min(0)]],
  });

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
      error: (fallo: Error) => {
        this.error.set(fallo.message || 'No fue posible registrar la solicitud');
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
