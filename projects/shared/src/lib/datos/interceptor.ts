import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { desdeHttp } from '../core/errores';

export const interceptorErrores: HttpInterceptorFn = (peticion, siguiente) =>
  siguiente(peticion).pipe(
    catchError((error: HttpErrorResponse) => throwError(() => desdeHttp(error))),
  );
