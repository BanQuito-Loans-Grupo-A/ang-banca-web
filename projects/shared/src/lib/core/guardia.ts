import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from './sesion.service';

export function guardiaSesion(destino: string): CanActivateFn {
  return () => {
    const sesion = inject(SesionService);
    const router = inject(Router);
    return sesion.sesion() ? true : router.createUrlTree([destino]);
  };
}
