import { HttpErrorResponse } from '@angular/common/http';

export type CodigoError =
  | 'RECURSO_NO_ENCONTRADO'
  | 'PAGO_NO_PERMITIDO'
  | 'PAGO_YA_APLICADO'
  | 'CONFLICTO_CONCURRENCIA'
  | 'PETICION_INVALIDA'
  | 'ERROR_INTERNO'
  | 'ANALISTA_NO_HABILITADO'
  | 'ABONO_CON_CUOTAS_VENCIDAS'
  | 'SIN_FOTOGRAFIA_CARTERA'
  | 'RANGO_FECHAS_INVALIDO'
  | 'SIN_CONEXION';

export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  codigo?: CodigoError;
}

const MENSAJES: Record<CodigoError, string> = {
  RECURSO_NO_ENCONTRADO: 'No encontramos lo que busca',
  PAGO_NO_PERMITIDO: 'El valor no se puede aplicar a esta operación',
  PAGO_YA_APLICADO: 'Ese pago ya fue aplicado',
  CONFLICTO_CONCURRENCIA: 'Alguien más modificó la operación; vuelva a intentarlo',
  PETICION_INVALIDA: 'Revise los datos ingresados',
  ERROR_INTERNO: 'El servicio tuvo un problema; intente de nuevo en un momento',
  ANALISTA_NO_HABILITADO: 'El analista no está activo',
  ABONO_CON_CUOTAS_VENCIDAS: 'La operación tiene cuotas vencidas; use el simulador de pagos',
  SIN_FOTOGRAFIA_CARTERA: 'No hay fotografía de cartera para esa fecha de corte',
  RANGO_FECHAS_INVALIDO: 'El rango de fechas no es válido',
  SIN_CONEXION: 'No pudimos contactar al servicio',
};

export class ErrorBanquito extends Error {
  constructor(
    mensaje: string,
    readonly codigo: CodigoError,
    readonly estado: number,
  ) {
    super(mensaje);
    this.name = 'ErrorBanquito';
  }
}

export function desdeHttp(error: HttpErrorResponse): ErrorBanquito {
  if (error.status === 0) {
    return new ErrorBanquito(MENSAJES.SIN_CONEXION, 'SIN_CONEXION', 0);
  }
  const cuerpo = (error.error ?? {}) as ProblemDetail;
  const codigo: CodigoError = cuerpo.codigo ?? 'ERROR_INTERNO';
  const mensaje = cuerpo.detail || cuerpo.title || MENSAJES[codigo] || MENSAJES.ERROR_INTERNO;
  return new ErrorBanquito(mensaje, codigo, error.status);
}

export function mensajeDe(error: unknown, respaldo: string): string {
  if (error instanceof ErrorBanquito) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return respaldo;
}
