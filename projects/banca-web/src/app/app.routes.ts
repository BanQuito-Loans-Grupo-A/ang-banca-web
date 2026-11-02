import { Routes } from '@angular/router';
import { guardiaSesion } from 'shared';

export const rutas: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'simulador' },
  {
    path: 'simulador',
    title: 'Simulador de crédito · BanQuito',
    loadComponent: () => import('./paginas/simulador').then((m) => m.Simulador),
  },
  {
    path: 'ingreso',
    title: 'Identificarse · BanQuito',
    loadComponent: () => import('./paginas/ingreso').then((m) => m.Ingreso),
  },
  {
    path: 'solicitud',
    canActivate: [guardiaSesion('/ingreso')],
    title: 'Solicitar crédito · BanQuito',
    loadComponent: () => import('./paginas/solicitud').then((m) => m.Solicitud),
  },
  {
    path: 'mis-solicitudes',
    canActivate: [guardiaSesion('/ingreso')],
    title: 'Mis solicitudes · BanQuito',
    loadComponent: () => import('./paginas/mis-solicitudes').then((m) => m.MisSolicitudes),
  },
  {
    path: 'mis-operaciones',
    canActivate: [guardiaSesion('/ingreso')],
    title: 'Mis préstamos · BanQuito',
    loadComponent: () => import('./paginas/mis-operaciones').then((m) => m.MisOperaciones),
  },
  {
    path: 'mis-operaciones/:numero',
    canActivate: [guardiaSesion('/ingreso')],
    title: 'Detalle del préstamo · BanQuito',
    loadComponent: () => import('./paginas/operacion-detalle').then((m) => m.OperacionDetallePagina),
  },
  { path: '**', redirectTo: 'simulador' },
];
