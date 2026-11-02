import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { proveerDatos } from 'shared';
import { entorno } from '../entorno';
import { rutas } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(rutas, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    ...proveerDatos(entorno),
  ],
};
