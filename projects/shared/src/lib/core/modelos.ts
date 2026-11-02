export type SistemaAmortizacion = 'FRANCES' | 'ALEMAN';
export type DestinoCredito = 'BIENES_DURADEROS' | 'SALUD' | 'EDUCACION' | 'VIAJE' | 'OTRO';
export type EstadoSolicitud = 'REGISTRADA' | 'RECHAZADA' | 'APROBADA' | 'DESEMBOLSADA';
export type EstadoPrestamo = 'POR_VENCER' | 'VENCIDA' | 'EN_LITIGIO' | 'CASTIGADA' | 'CANCELADA';
export type EstadoCuota = 'PENDIENTE' | 'PAGO_PARCIAL' | 'PAGADA' | 'ANULADA' | 'LIQUIDADA';
export type EstadoDiaNegocio = 'ABIERTO' | 'EN_CIERRE' | 'FALLIDO' | 'CERRADO';
export type EstadoEtapaCierre = 'EN_PROCESO' | 'EXITOSA' | 'FALLIDA';
export type EstadoInstruccion = 'GENERADA' | 'ENVIADA' | 'APLICADA' | 'RECHAZADA';
export type ModalidadAbono = 'REDUCIR_CUOTA' | 'REDUCIR_PLAZO';
export type TipoEvaluacion = 'REFERENCIAL' | 'DEFINITIVA';
export type Perfil = 'cliente' | 'analista';

export interface Pagina<T> {
  content: T[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
}

export interface CondicionesSimulador {
  montoMinimo: number;
  montoMaximo: number;
  plazoMinimo: number;
  plazoMaximo: number;
  teaReferencial: number;
  fechaNegocio: string;
  sistemasAmortizacion: string[];
}

export interface SolicitudSimulacion {
  monto: number;
  plazoMeses: number;
  sistemaAmortizacion: SistemaAmortizacion;
}

export interface CuotaCalculada {
  numero: number;
  fechaVencimiento: string;
  capital: number;
  interes: number;
  seguro: number;
  cuotaTotal: number;
  saldoCapitalPosterior: number;
}

export interface Simulacion {
  sistemaAmortizacion: string;
  monto: number;
  plazoMeses: number;
  teaReferencial: number;
  tasaNominalAnual: number;
  tasaMensual: number;
  cuotaPrimera: number;
  cuotaUltima: number;
  seguroMensual: number;
  contribucionSolca: number;
  montoNeto: number;
  totalIntereses: number;
  totalSeguros: number;
  costoTotal: number;
  tabla: CuotaCalculada[];
}

export interface RegistroSolicitud {
  identificacion: string;
  numeroCuentaDesembolso: string;
  montoSolicitado: number;
  plazoMes: number;
  sistemaAmortizacion: SistemaAmortizacion;
  destino: DestinoCredito;
  ingresoMensual: number;
  gastoMensual: number;
}

export interface EvaluacionRespuesta {
  idEvaluacionCapacidad: number;
  idSolicitud: number;
  idAnalista: number | null;
  idDiaNegocio: number;
  tipoEvaluacion: TipoEvaluacion;
  teaUtilizada: number;
  remanenteMensual: number;
  cuotaMaximaAdmisible: number;
  cuotaProyectada: number;
  cumple: boolean;
}

export interface SolicitudRegistrada {
  idSolicitud: number;
  identificacion: string;
  numeroCuentaDesembolso: string;
  montoSolicitado: number;
  plazoMes: number;
  sistemaAmortizacion: SistemaAmortizacion;
  destino: DestinoCredito;
  estado: EstadoSolicitud;
  motivoRechazo: string | null;
  fechaHoraRegistro: string;
  evaluacionReferencial: EvaluacionRespuesta;
}

export interface SolicitudCliente {
  idSolicitud: number;
  montoSolicitado: number;
  plazoMes: number;
  sistemaAmortizacion: SistemaAmortizacion;
  destino: DestinoCredito;
  estado: EstadoSolicitud;
  teaAsignada: number | null;
  motivoRechazo: string | null;
  fechaHoraRegistro: string;
  fechaHoraResolucion: string | null;
}

export interface SolicitudBandeja {
  idSolicitud: number;
  identificacionCliente: string;
  nombreCompletoCliente: string;
  montoSolicitado: number;
  plazoMes: number;
  sistemaAmortizacion: SistemaAmortizacion;
  destino: DestinoCredito;
  ingresoMensual: number;
  gastoMensual: number;
  remanenteMensual: number;
  cuotaMaximaAdmisible: number;
  cuotaProyectada: number;
  porcentajeCuotaSobreRemanente: number;
  fechaHoraRegistro: string;
}

export interface SolicitudResumen {
  idSolicitud: number;
  idCliente: number;
  identificacionCliente: string;
  nombreCompletoCliente: string;
  numeroCuentaDesembolso: string;
  montoSolicitado: number;
  plazoMes: number;
  sistemaAmortizacion: SistemaAmortizacion;
  destino: DestinoCredito;
  ingresoMensual: number;
  gastoMensual: number;
  estado: EstadoSolicitud;
  teaAsignada: number | null;
  motivoRechazo: string | null;
  idAnalista: number | null;
  fechaHoraRegistro: string;
  fechaHoraResolucion: string | null;
}

export interface SolicitudDetalle {
  solicitud: SolicitudResumen;
  evaluaciones: EvaluacionRespuesta[];
}

export interface AprobacionSolicitud {
  tea: number;
  idAnalista: number;
}

export interface RechazoSolicitud {
  motivo: string;
  idAnalista: number;
}

export interface ResolucionRespuesta {
  idSolicitud: number;
  estado: EstadoSolicitud;
  teaAsignada: number | null;
  tasaNominalAnual: number | null;
  tasaMensual: number | null;
  motivoRechazo: string | null;
  idAnalista: number;
  fechaHoraResolucion: string;
  evaluacionDefinitiva: EvaluacionRespuesta | null;
}

export interface DesembolsoSolicitud {
  solicitudId: number;
  cuentaDestino?: string;
  idAnalista: number;
}

export interface OperacionDetalle {
  idPrestamo: number;
  numeroPrestamo: string;
  idSolicitud: number;
  identificacionCliente: string;
  nombreCompletoCliente: string;
  cuentaDestino: string;
  sistemaAmortizacion: SistemaAmortizacion;
  montoAprobado: number;
  plazoMes: number;
  teaAsignada: number;
  tasaNominalAnual: number;
  tasaMensual: number;
  seguroMensual: number;
  contribucionSolca: number;
  montoNeto: number;
  fechaDesembolso: string;
  referenciaDesembolso: string;
  estadoInstruccion: EstadoInstruccion;
  estado: EstadoPrestamo;
  diaMora: number;
  saldoCapital: number;
  interesDevengadoAcumulado: number;
  provision: number;
  fechaCancelacion: string | null;
  fechaCastigo: string | null;
}

export interface OperacionResumen {
  idPrestamo: number;
  numeroPrestamo: string;
  identificacionCliente: string;
  nombreCompletoCliente: string;
  sistemaAmortizacion: SistemaAmortizacion;
  montoAprobado: number;
  saldoCapital: number;
  estado: EstadoPrestamo;
  diaMora: number;
  fechaDesembolso: string;
}

export interface OperacionCliente {
  numeroPrestamo: string;
  sistemaAmortizacion: SistemaAmortizacion;
  montoAprobado: number;
  saldoCapital: number;
  fechaProximoVencimiento: string | null;
  valorProximaCuota: number | null;
  estado: EstadoPrestamo;
  diaMora: number;
}

export interface CuotaTabla {
  idCuota: number;
  numeroCuota: number;
  fechaVencimiento: string;
  capital: number;
  interes: number;
  seguro: number;
  cuotaTotal: number;
  saldoCapitalPosterior: number;
  estado: EstadoCuota;
  capitalPagado: number;
  interesPagado: number;
  seguroPagado: number;
  moraAcumulada: number;
  moraPagada: number;
  fechaPago: string | null;
}

export interface PagoAplicado {
  idPago: number;
  idDiaNegocio: number;
  tipoPago: string;
  montoRecibido: number;
  aplicadoSeguro: number;
  aplicadoMora: number;
  aplicadoInteres: number;
  aplicadoCapital: number;
  aplicadoAnticipado: number;
  excedenteDevolver: number;
  esRecuperacion: boolean;
}

export interface CargoMoraCuota {
  idCuota: number;
  numeroCuota: number;
  fechaVencimiento: string;
  moraAcumulada: number;
  moraPagada: number;
  moraPendiente: number;
}

export interface MovimientoEstado {
  idDiaNegocio: number;
  estadoAnterior: EstadoPrestamo | null;
  estadoNuevo: EstadoPrestamo;
  diaMora: number;
  fechaHoraRegistro: string;
}

export interface FilaCuota {
  numero: number;
  fechaVencimiento: string;
  capital: number;
  interes: number;
  seguro: number;
  cuotaTotal: number;
  saldoCapitalPosterior: number;
}

export interface SolicitudAbono {
  monto: number;
  modalidad: ModalidadAbono;
}

export interface CuadroAbono {
  numeroOperacion: string;
  fechaAbono: string;
  modalidad: ModalidadAbono;
  montoAbono: number;
  interesLiquidado: number;
  capitalAbonado: number;
  saldoAnterior: number;
  nuevoSaldo: number;
  cuotasRestantes: number;
  nuevoPlazo: number;
  fechaUltimaCuota: string;
  totalIntereses: number;
  cuotas: FilaCuota[];
}

export type TratamientoAbono = 'ABONO_EXTRAORDINARIO' | 'PAGO_POR_PRELACION';

export interface DesglosePrelacion {
  idPago: number;
  monto: number;
  aplicadoSeguro: number;
  aplicadoMora: number;
  aplicadoInteres: number;
  aplicadoCapital: number;
  operacionCancelada: boolean;
}

export interface AbonoRegistrado {
  idPago: number;
  tratamiento: TratamientoAbono;
  cuadro: CuadroAbono | null;
  pagoPorPrelacion: DesglosePrelacion | null;
}

export interface ResumenAbono {
  idPago: number;
  fecha: string;
  modalidad: ModalidadAbono;
  montoRecibido: number;
  interesLiquidado: number;
  capitalAbonado: number;
  idAnalista: number;
}

export interface Liquidacion {
  numeroOperacion: string;
  fechaCorte: string;
  capitalInsoluto: number;
  interesesVencidos: number;
  interesCuotaEnCurso: number;
  segurosVencidos: number;
  moraVencida: number;
  valorCancelacion: number;
}

export interface CancelacionRegistrada {
  idPago: number;
  liquidacion: Liquidacion;
}

export interface CierreRespuesta {
  fechaNegocio: string;
  estado: EstadoDiaNegocio;
  intentoCierre: number;
  ultimaEtapaCompletada: number;
  fechaHoraInicioCierre: string | null;
  fechaHoraFinCierre: string | null;
  duracionSegundos: number | null;
  observacion: string | null;
}

export interface EtapaCierreRespuesta {
  numeroEtapa: number;
  intento: number;
  estado: EstadoEtapaCierre;
  fechaHoraInicio: string;
  fechaHoraFin: string | null;
  duracionMilisegundos: number | null;
  observacion: string | null;
}

export interface ProgramacionCierre {
  cron: string;
  activa: boolean;
}

export interface FechaNegocio {
  fechaNegocio: string;
  estado: EstadoDiaNegocio;
  ultimaFechaCerrada: string | null;
}

export interface Parametro {
  codigo: string;
  nombre: string;
  valorNumerico: number | null;
  valorFecha: string | null;
  vigenteDesde: string;
}

export interface TramoCartera {
  numeroTramo: number;
  diaMoraMinimo: number;
  estadoCartera: EstadoPrestamo;
  devengaEnResultado: boolean;
  acumulaMora: boolean;
  porcentajeProvision: number;
  vigenteDesde: string;
}

export interface ReporteMorosidad {
  fechaCorte: string;
  saldoVencida: number;
  saldoEnLitigio: number;
  saldoVencidaYEnLitigio: number;
  carteraBruta: number;
  indiceMorosidad: number;
  saldoCastigada: number;
}

export interface FilaTramo {
  numeroTramo: number;
  estadoCartera: string;
  operaciones: number;
  saldoCapital: number;
  porcentajeSaldo: number;
  provision: number;
}

export interface ReporteComposicionTramos {
  fechaCorte: string;
  tramos: FilaTramo[];
  total: { operaciones: number; saldoCapital: number; porcentajeSaldo: number; provision: number };
}

export interface FilaDistribucion {
  categoria: string;
  operaciones: number;
  saldoCapital: number;
  porcentajeSaldo: number;
}

export interface ReporteSaludPortafolio {
  fechaCorte: string;
  indiceMorosidad: number;
  coberturaProvisiones: number;
  concentracionDiezMayores: number;
  distribucionPorMonto: FilaDistribucion[];
  distribucionPorPlazo: FilaDistribucion[];
  distribucionPorSistema: FilaDistribucion[];
}

export type EvolucionTramo = 'MEJORO' | 'SE_MANTUVO' | 'EMPEORO' | 'CANCELADA';

export interface DestinoRollRate {
  destino: string;
  evolucion: EvolucionTramo;
  operaciones: number;
  saldoInicial: number;
  porcentajeSaldo: number;
}

export interface FilaRollRate {
  tramoInicial: number;
  operaciones: number;
  saldoInicial: number;
  destinos: DestinoRollRate[];
}

export interface ReporteRollRate {
  fechaInicial: string;
  fechaFinal: string;
  filas: FilaRollRate[];
}

export type EstadoPersona = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';

export interface ClienteIdentificado {
  idCliente: number;
  tipoIdentificacion: string;
  identificacion: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  telefono: string | null;
  email: string | null;
  estado: EstadoPersona;
}

export interface AnalistaIdentificado {
  idAnalista: number;
  tipoIdentificacion: string;
  identificacion: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  estado: EstadoPersona;
}
