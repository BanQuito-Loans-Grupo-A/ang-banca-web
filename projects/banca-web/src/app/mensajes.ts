import { ErrorBanquito } from 'shared';

const MENSAJES: Record<string, string> = {
  SIN_CONEXION: 'No pudimos conectarnos. Revise su conexión a internet e intente de nuevo.',
  ERROR_INTERNO: 'Tuvimos un inconveniente. Intente de nuevo en unos minutos.',
  PETICION_INVALIDA: 'Revise los datos ingresados e intente de nuevo.',
  MONTO_FUERA_DE_RANGO: 'El monto elegido no está disponible para este crédito. Elija un monto dentro del rango indicado.',
  PLAZO_FUERA_DE_RANGO: 'El plazo elegido no está disponible para este crédito. Elija uno de los plazos de la lista.',
  CLIENTE_NO_HABILITADO: 'Por ahora no podemos recibir su solicitud. Comuníquese con nosotros o acérquese a una agencia.',
  CUENTA_NO_VALIDA: 'La cuenta elegida no puede recibir el préstamo. Elija otra de sus cuentas activas.',
  CUENTA_DESEMBOLSO_OBLIGATORIA: 'Elija la cuenta donde quiere recibir el préstamo.',
  CLIENTE_CON_MORA: 'Tiene pagos atrasados en un préstamo. Póngase al día para solicitar un nuevo crédito.',
  SOLICITUD_PENDIENTE: 'Ya tiene una solicitud en revisión. Cuando reciba la respuesta podrá registrar otra.',
  RECURSO_NO_ENCONTRADO: 'No encontramos la información que busca.',
  OPERACION_NO_ENCONTRADA: 'No encontramos ese préstamo entre sus productos.',
  CONFLICTO_CONCURRENCIA: 'La información cambió mientras la consultaba. Intente de nuevo.',
};

export function mensajeCliente(fallo: unknown, respaldo: string): string {
  if (fallo instanceof ErrorBanquito) {
    return MENSAJES[fallo.codigo] ?? (fallo.estado >= 500 ? MENSAJES['ERROR_INTERNO'] : respaldo);
  }
  return respaldo;
}

export function motivoParaCliente(motivo: string | null): string | null {
  if (!motivo) {
    return motivo;
  }
  if (/cuota proyectada|cuota maxima admisible|cuota máxima admisible/i.test(motivo)) {
    return 'La cuota de este crédito supera lo que sus ingresos y gastos le permiten pagar cada mes. Puede intentar con un monto menor o un plazo más largo.';
  }
  return motivo;
}

export function plazosDisponibles(minimo: number, maximo: number): number[] {
  const opciones: number[] = [];
  for (let meses = Math.max(6, Math.ceil(minimo / 6) * 6); meses <= Math.min(60, maximo); meses += 6) {
    opciones.push(meses);
  }
  return opciones;
}
