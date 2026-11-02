import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EnlaceNavegacion, FechaNegocioService, Marco } from 'shared';

@Component({
  selector: 'bw-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Marco],
  template: `<bq-marco area="Banca Web" inicio="/simulador" [enlaces]="enlaces" />`,
})
export class App {
  private readonly fechaNegocio = inject(FechaNegocioService);

  protected readonly enlaces: EnlaceNavegacion[] = [
    { ruta: '/simulador', texto: 'Simulador', icono: 'calculadora' },
    { ruta: '/solicitud', texto: 'Solicitar crédito', icono: 'documento' },
    { ruta: '/mis-solicitudes', texto: 'Mis solicitudes', icono: 'capas' },
    { ruta: '/mis-operaciones', texto: 'Mis préstamos', icono: 'cartera' },
  ];

  constructor() {
    this.fechaNegocio.cargar();
  }
}
