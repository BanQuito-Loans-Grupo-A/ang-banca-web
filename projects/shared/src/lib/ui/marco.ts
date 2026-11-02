import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { FechaNegocioService } from '../core/fecha-negocio.service';
import { SesionService } from '../core/sesion.service';
import { TemaService } from '../core/tema.service';
import { FechaPipe } from '../pipes/fecha.pipe';
import { Icono } from './icono';
import { NombreIcono } from './iconos';
import { Logo } from './logo';
import { Pie } from './pie';

export interface EnlaceNavegacion {
  ruta: string;
  texto: string;
  icono: NombreIcono;
}

@Component({
  selector: 'bq-marco',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Icono, Logo, Pie, FechaPipe],
  template: `
    <a class="bq-salto" href="#contenido">Saltar al contenido principal</a>

    @if (pantallaCompleta()) {
      <main id="contenido" class="contenido" tabindex="-1">
        <router-outlet />
      </main>
    } @else {
      <header class="cabecera">
        <div class="bq-contenedor cabecera__interior">
          <a class="cabecera__marca" [routerLink]="inicio()">
            <bq-logo />
            <span class="bq-solo-lectores">BanQuito, ir al inicio</span>
          </a>

          <nav
            id="navegacion-principal"
            class="nav"
            [class.nav--abierta]="menuAbierto()"
            aria-label="Navegación principal"
          >
            <ul>
              @for (enlace of enlaces(); track enlace.ruta) {
                <li>
                  <a
                    [routerLink]="enlace.ruta"
                    routerLinkActive="activo"
                    [routerLinkActiveOptions]="{ exact: enlace.ruta === inicio() }"
                    (click)="cerrarMenu()"
                  >
                    {{ enlace.texto }}
                  </a>
                </li>
              }
            </ul>
          </nav>

          <div class="cabecera__acciones">
            @if (fechaNegocio.estado(); as estado) {
              <p class="fecha">
                <bq-icono class="fecha__icono" nombre="calendario" [tamano]="24" />
                <span class="fecha__texto">
                  <span class="fecha__clave">Fecha de negocio</span>
                  <span class="fecha__valor">{{ estado.fechaNegocio | fecha }}</span>
                </span>
              </p>
            }
            @if (sesion.sesion(); as actual) {
              <button type="button" class="usuario" (click)="sesion.salir()">
                <span class="usuario__nombre">{{ actual.nombre }}</span>
                <bq-icono nombre="salir" [tamano]="16" etiqueta="Cerrar sesión" />
              </button>
            }
            <button
              type="button"
              class="bq-boton bq-boton--fantasma bq-boton--icono"
              (click)="tema.alternar()"
            >
              <bq-icono
                [nombre]="tema.tema() === 'oscuro' ? 'sol' : 'luna'"
                [etiqueta]="tema.tema() === 'oscuro' ? 'Activar modo claro' : 'Activar modo oscuro'"
              />
            </button>
            <button
              type="button"
              class="bq-boton bq-boton--fantasma bq-boton--icono hamburguesa"
              [attr.aria-expanded]="menuAbierto()"
              aria-controls="navegacion-principal"
              (click)="alternarMenu()"
            >
              <bq-icono
                [nombre]="menuAbierto() ? 'cerrar' : 'menu'"
                [etiqueta]="menuAbierto() ? 'Cerrar menú' : 'Abrir menú'"
              />
            </button>
          </div>
        </div>
      </header>

      <main id="contenido" class="contenido" tabindex="-1">
        <router-outlet />
      </main>

      <bq-pie />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }

    .cabecera {
      position: sticky;
      top: 0;
      z-index: 20;
      background: color-mix(in srgb, var(--bq-superficie) 92%, transparent);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--bq-borde);
    }

    .cabecera__interior {
      display: flex;
      align-items: center;
      gap: var(--bq-esp-5);
      min-height: 80px;
    }

    .cabecera__marca {
      display: inline-flex;
      align-items: center;
      text-decoration: none;
      margin-right: auto;
    }

    .nav {
      display: none;
    }

    .nav {
      margin-right: var(--bq-esp-4);
    }

    .nav ul {
      list-style: none;
      display: flex;
      align-items: center;
      gap: var(--bq-esp-4);
      margin: 0;
      padding: 0;
    }

    .nav a {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--bq-esp-2);
      padding: var(--bq-esp-3) var(--bq-esp-2);
      color: var(--bq-texto);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9375rem;
      white-space: nowrap;
      transition: color var(--bq-dur-rapida) var(--bq-salida);
    }

    .nav a::after {
      content: '';
      position: absolute;
      left: var(--bq-esp-2);
      right: var(--bq-esp-2);
      bottom: 0;
      height: 3px;
      border-radius: var(--bq-radio-pildora);
      background: var(--bq-marca-viva);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform var(--bq-dur) var(--bq-salida);
    }

    .nav a:hover {
      color: var(--bq-marca);
    }

    .nav a.activo {
      font-weight: 700;
    }

    .nav a.activo::after {
      transform: scaleX(1);
    }

    .cabecera__acciones {
      display: flex;
      align-items: center;
      gap: var(--bq-esp-2);
    }

    .fecha {
      display: none;
      align-items: center;
      gap: var(--bq-esp-3);
      margin: 0 var(--bq-esp-4) 0 0;
      padding-left: var(--bq-esp-5);
      border-left: 1px solid var(--bq-borde-fuerte);
      white-space: nowrap;
      line-height: 1.25;
    }

    .fecha__icono {
      color: var(--bq-texto);
    }

    .fecha__texto {
      display: flex;
      flex-direction: column;
    }

    .fecha__clave {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--bq-texto-tenue);
    }

    .fecha__valor {
      font-size: 0.9375rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--bq-texto);
    }

    .usuario {
      display: none;
      align-items: center;
      gap: var(--bq-esp-2);
      padding: var(--bq-esp-2) var(--bq-esp-3);
      border: 1px solid var(--bq-borde);
      border-radius: var(--bq-radio-pildora);
      background: transparent;
      color: var(--bq-texto-suave);
      font: inherit;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition:
        border-color var(--bq-dur-rapida) var(--bq-salida),
        color var(--bq-dur-rapida) var(--bq-salida);
    }

    .usuario:hover {
      border-color: var(--bq-marca);
      color: var(--bq-texto);
    }

    .usuario__nombre {
      max-width: 16ch;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .contenido {
      flex: 1;
    }

    .contenido:focus {
      outline: none;
    }

    @media (max-width: 1079px) {
      .nav--abierta {
        display: block;
        position: fixed;
        inset: 80px 0 auto;
        padding: var(--bq-esp-4) var(--bq-esp-5) var(--bq-esp-6);
        background: var(--bq-superficie);
        border-bottom: 1px solid var(--bq-borde);
        box-shadow: var(--bq-sombra-2);
        animation: bq-entrada var(--bq-dur) var(--bq-salida) both;
      }

      .nav--abierta ul {
        flex-direction: column;
        align-items: stretch;
        gap: var(--bq-esp-1);
      }

      .nav--abierta a {
        padding: var(--bq-esp-3) var(--bq-esp-2);
        font-size: 1.0625rem;
        border-bottom: 1px solid var(--bq-borde);
      }

      .nav--abierta a::after {
        display: none;
      }
    }

    @media (min-width: 1080px) {
      .nav {
        display: block;
      }

      .hamburguesa {
        display: none;
      }

      .fecha {
        display: flex;
      }

      .usuario {
        display: inline-flex;
      }
    }
  `,
})
export class Marco {
  readonly enlaces = input.required<EnlaceNavegacion[]>();
  readonly area = input('');
  readonly inicio = input('/');
  readonly rutasSinMarco = input<string[]>(['/ingreso']);

  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly pantallaCompleta = computed(() =>
    this.rutasSinMarco().some((ruta) => this.url().split('?')[0] === ruta),
  );

  protected readonly tema = inject(TemaService);
  protected readonly sesion = inject(SesionService);
  protected readonly fechaNegocio = inject(FechaNegocioService);
  protected readonly menuAbierto = signal(false);

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
