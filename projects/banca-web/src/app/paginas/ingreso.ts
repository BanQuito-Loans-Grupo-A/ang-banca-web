import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiBanquito, Icono, PantallaIngreso, SesionService, SoloDigitos, mensajeDe } from 'shared';

@Component({
  selector: 'bw-ingreso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icono, PantallaIngreso, SoloDigitos],
  template: `
    <bq-pantalla-ingreso
      titulo="Bienvenido a BanQuito"
      descripcion="Simule, solicite y siga su préstamo de consumo de forma segura y 100% en línea."
      tituloFormulario="Ingresa a tu Banca Web"
    >
      <form class="formulario" [formGroup]="formulario" (ngSubmit)="ingresar()" novalidate>
        @if (error()) {
          <div class="bq-aviso bq-aviso--error" role="alert">
            <bq-icono nombre="alerta" />
            <p>{{ error() }}</p>
          </div>
        }

        <div class="bq-campo">
          <label class="bq-campo__etiqueta" for="identificacion">
            <bq-icono nombre="identificacion" [tamano]="24" />
            Cédula
          </label>
          <input
            id="identificacion"
            class="bq-entrada"
            formControlName="identificacion"
            bqSoloDigitos
            inputmode="numeric"
            maxlength="10"
            autocomplete="username"
            placeholder="Ingresa tu número de cédula"
            aria-describedby="ayuda"
            [attr.aria-invalid]="control.touched && control.invalid"
          />
          <p class="bq-campo__ayuda" id="ayuda">
            10 dígitos, sin guiones. No pedimos contraseña: solo verás tus solicitudes y préstamos.
          </p>
          @if (control.touched && control.invalid) {
            <p class="bq-campo__error" role="alert">
              <bq-icono nombre="alerta" [tamano]="15" />
              Ingresa una cédula de 10 dígitos
            </p>
          }
        </div>

        <button class="bq-boton bq-boton--bloque" type="submit" [disabled]="verificando()">
          {{ verificando() ? 'Verificando…' : 'Ingresar' }}
        </button>

        <p class="bq-separador">¿Aún no tienes un crédito?</p>

        <a class="bq-boton bq-boton--contorno bq-boton--bloque" routerLink="/simulador">
          <bq-icono nombre="calculadora" [tamano]="20" />
          Simula tu crédito
        </a>
      </form>
    </bq-pantalla-ingreso>
  `,
  styles: `
    .formulario {
      display: flex;
      flex-direction: column;
      gap: var(--bq-esp-5);
    }
  `,
})
export class Ingreso {
  private readonly api = inject(ApiBanquito);
  private readonly fb = inject(FormBuilder);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  protected readonly verificando = signal(false);
  protected readonly error = signal('');

  protected readonly formulario = this.fb.nonNullable.group({
    identificacion: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
  });

  protected get control() {
    return this.formulario.controls.identificacion;
  }

  protected ingresar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.verificando.set(true);
    this.error.set('');
    const identificacion = this.formulario.getRawValue().identificacion;
    this.api.identificarCliente(identificacion).subscribe({
      next: (cliente) => {
        this.sesion.ingresar({
          perfil: 'cliente',
          identificacion: cliente.identificacion,
          nombre: cliente.nombreCompleto,
          idAnalista: 0,
        });
        this.verificando.set(false);
        this.router.navigate(['/mis-operaciones']);
      },
      error: (fallo) => {
        this.error.set(mensajeDe(fallo, 'No encontramos esa cédula en nuestros registros'));
        this.verificando.set(false);
      },
    });
  }
}
