import { EnvironmentProviders, InjectionToken, Provider } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApiBanquito } from './api';
import { ApiHttp } from './api-http';
import { ApiMock } from './api-mock';
import { interceptorErrores } from './interceptor';

export const BASE_API = new InjectionToken<string>('BASE_API');

export interface OpcionesDatos {
  usarMock: boolean;
  baseApi: string;
}

export function proveerDatos(opciones: OpcionesDatos): Array<Provider | EnvironmentProviders> {
  return [
    provideHttpClient(withFetch(), withInterceptors([interceptorErrores])),
    { provide: BASE_API, useValue: opciones.baseApi },
    { provide: ApiBanquito, useClass: opciones.usarMock ? ApiMock : ApiHttp },
  ];
}
