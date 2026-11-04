import { Observable } from 'rxjs';
import {
  AbonoRegistrado, CancelacionRegistrada, CargoMoraCuota, CierreRespuesta, CondicionesSimulador,
  CuadroAbono, CuotaTabla, EtapaCierreRespuesta, ProgramacionCierre, FechaNegocio, Liquidacion, MovimientoEstado,
  OperacionCliente, OperacionDetalle, OperacionResumen, Pagina, PagoAplicado, Parametro,
  ReporteComposicionTramos, ReporteMorosidad, ReporteRollRate, ReporteSaludPortafolio,
  ResolucionRespuesta, ResumenAbono, Simulacion, SolicitudAbono, SolicitudBandeja, SolicitudCliente,
  SolicitudDetalle, SolicitudRegistrada, SolicitudSimulacion, TramoCartera,
  RegistroSolicitud, AprobacionSolicitud, RechazoSolicitud, DesembolsoSolicitud,
  ClienteIdentificado, AnalistaIdentificado, CuentaCliente, DatosTramo, NuevoValorParametro, ArchivoRecaudacion,
} from '../core/modelos';

export abstract class ApiBanquito {
  abstract condicionesProducto(): Observable<CondicionesSimulador>;
  abstract simular(peticion: SolicitudSimulacion): Observable<Simulacion>;
  abstract fechaNegocio(): Observable<FechaNegocio>;

  abstract identificarCliente(identificacion: string): Observable<ClienteIdentificado>;
  abstract cuentasDelCliente(identificacion: string): Observable<CuentaCliente[]>;
  abstract identificarAnalista(identificacion: string): Observable<AnalistaIdentificado>;

  abstract registrarSolicitud(registro: RegistroSolicitud): Observable<SolicitudRegistrada>;
  abstract solicitudesDelCliente(identificacion: string, pagina: number): Observable<Pagina<SolicitudCliente>>;
  abstract bandejaSolicitudes(estado: string, pagina: number): Observable<Pagina<SolicitudBandeja>>;
  abstract detalleSolicitud(idSolicitud: number): Observable<SolicitudDetalle>;
  abstract aprobarSolicitud(idSolicitud: number, cuerpo: AprobacionSolicitud): Observable<ResolucionRespuesta>;
  abstract rechazarSolicitud(idSolicitud: number, cuerpo: RechazoSolicitud): Observable<ResolucionRespuesta>;

  abstract desembolsar(cuerpo: DesembolsoSolicitud): Observable<OperacionDetalle>;
  abstract buscarOperaciones(filtro: { numero?: string; identificacion?: string }, pagina: number): Observable<Pagina<OperacionResumen>>;
  abstract operacionesDelCliente(identificacion: string, pagina: number): Observable<Pagina<OperacionCliente>>;
  abstract detalleOperacion(numero: string): Observable<OperacionDetalle>;
  abstract tablaAmortizacion(numero: string): Observable<CuotaTabla[]>;
  abstract pagosDeOperacion(numero: string, pagina: number): Observable<Pagina<PagoAplicado>>;
  abstract cargosMora(numero: string): Observable<CargoMoraCuota[]>;
  abstract movimientosEstado(numero: string): Observable<MovimientoEstado[]>;

  abstract simularAbono(numero: string, cuerpo: SolicitudAbono): Observable<CuadroAbono>;
  abstract registrarAbono(numero: string, cuerpo: SolicitudAbono, idAnalista: number): Observable<AbonoRegistrado>;
  abstract abonosDeOperacion(numero: string): Observable<ResumenAbono[]>;
  abstract liquidacion(numero: string): Observable<Liquidacion>;
  abstract cancelar(numero: string, idAnalista: number): Observable<CancelacionRegistrada>;

  abstract iniciarCierre(): Observable<CierreRespuesta>;
  abstract reintentarCierre(fecha: string): Observable<CierreRespuesta>;
  abstract listarCierres(desde?: string, hasta?: string): Observable<CierreRespuesta[]>;
  abstract detalleCierre(fecha: string): Observable<CierreRespuesta>;
  abstract etapasCierre(fecha: string): Observable<EtapaCierreRespuesta[]>;
  abstract programacionCierre(): Observable<ProgramacionCierre>;

  abstract parametros(): Observable<Parametro[]>;
  abstract parametrosProgramados(): Observable<Parametro[]>;
  abstract actualizarParametro(codigo: string, cuerpo: NuevoValorParametro): Observable<Parametro>;
  abstract tramosCartera(fecha?: string): Observable<TramoCartera[]>;
  abstract programarTramos(tramos: DatosTramo[], vigenteDesde: string): Observable<TramoCartera[]>;

  abstract reporteMorosidad(fechaCorte: string): Observable<ReporteMorosidad>;
  abstract reporteComposicion(fechaCorte: string): Observable<ReporteComposicionTramos>;
  abstract reporteSalud(fechaCorte: string): Observable<ReporteSaludPortafolio>;
  abstract reporteRollRate(fechaInicial: string, fechaFinal: string): Observable<ReporteRollRate>;
  abstract archivosRecaudacion(fecha: string): Observable<ArchivoRecaudacion[]>;
  abstract archivoNovedades(idArchivo: number): Observable<Blob>;
}
