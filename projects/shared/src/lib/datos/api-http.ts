import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBanquito } from './api';
import { BASE_API } from './configuracion';
import {
  AbonoRegistrado, AprobacionSolicitud, CancelacionRegistrada, CargoMoraCuota, CierreRespuesta,
  CondicionesSimulador, CuadroAbono, CuotaTabla, DesembolsoSolicitud, EtapaCierreRespuesta,
  FechaNegocio, Liquidacion, MovimientoEstado, OperacionCliente, OperacionDetalle, OperacionResumen,
  Pagina, PagoAplicado, Parametro, RechazoSolicitud, RegistroSolicitud, ReporteComposicionTramos,
  ReporteMorosidad, ReporteRollRate, ReporteSaludPortafolio, ResolucionRespuesta, ResumenAbono,
  Simulacion, SolicitudAbono, SolicitudBandeja, SolicitudCliente, SolicitudDetalle,
  SolicitudRegistrada, SolicitudSimulacion, TramoCartera, ClienteIdentificado, AnalistaIdentificado,
  CuentaCliente, DatosTramo, NuevoValorParametro,
} from '../core/modelos';

@Injectable()
export class ApiHttp extends ApiBanquito {
  private readonly http = inject(HttpClient);
  private readonly base = inject(BASE_API);

  private url(ruta: string): string {
    return `${this.base}/api/v1${ruta}`;
  }

  private paginado(pagina: number, extra: Record<string, string> = {}): HttpParams {
    let params = new HttpParams().set('page', pagina).set('size', 20);
    for (const [clave, valor] of Object.entries(extra)) {
      if (valor) {
        params = params.set(clave, valor);
      }
    }
    return params;
  }

  condicionesProducto(): Observable<CondicionesSimulador> {
    return this.http.get<CondicionesSimulador>(this.url('/condiciones-producto'));
  }

  simular(peticion: SolicitudSimulacion): Observable<Simulacion> {
    return this.http.post<Simulacion>(this.url('/simulaciones'), peticion);
  }

  fechaNegocio(): Observable<FechaNegocio> {
    return this.http.get<FechaNegocio>(this.url('/fecha-negocio'));
  }

  cuentasDelCliente(identificacion: string): Observable<CuentaCliente[]> {
    return this.http.get<CuentaCliente[]>(this.url(`/clientes/${identificacion}/cuentas`));
  }

  identificarCliente(identificacion: string): Observable<ClienteIdentificado> {
    return this.http.get<ClienteIdentificado>(this.url(`/clientes/${identificacion}`));
  }

  identificarAnalista(identificacion: string): Observable<AnalistaIdentificado> {
    return this.http.get<AnalistaIdentificado>(this.url(`/analistas/${identificacion}`));
  }

  registrarSolicitud(registro: RegistroSolicitud): Observable<SolicitudRegistrada> {
    return this.http.post<SolicitudRegistrada>(this.url('/solicitudes'), registro);
  }

  solicitudesDelCliente(identificacion: string, pagina: number): Observable<Pagina<SolicitudCliente>> {
    return this.http.get<Pagina<SolicitudCliente>>(this.url(`/clientes/${identificacion}/solicitudes`), {
      params: this.paginado(pagina),
    });
  }

  bandejaSolicitudes(estado: string, pagina: number): Observable<Pagina<SolicitudBandeja>> {
    return this.http.get<Pagina<SolicitudBandeja>>(this.url('/solicitudes'), {
      params: this.paginado(pagina, { estado }),
    });
  }

  detalleSolicitud(idSolicitud: number): Observable<SolicitudDetalle> {
    return this.http.get<SolicitudDetalle>(this.url(`/solicitudes/${idSolicitud}`));
  }

  aprobarSolicitud(idSolicitud: number, cuerpo: AprobacionSolicitud): Observable<ResolucionRespuesta> {
    return this.http.post<ResolucionRespuesta>(this.url(`/solicitudes/${idSolicitud}/aprobacion`), cuerpo);
  }

  rechazarSolicitud(idSolicitud: number, cuerpo: RechazoSolicitud): Observable<ResolucionRespuesta> {
    return this.http.post<ResolucionRespuesta>(this.url(`/solicitudes/${idSolicitud}/rechazo`), cuerpo);
  }

  desembolsar(cuerpo: DesembolsoSolicitud): Observable<OperacionDetalle> {
    return this.http.post<OperacionDetalle>(this.url('/operaciones'), cuerpo);
  }

  buscarOperaciones(filtro: { numero?: string; identificacion?: string }, pagina: number): Observable<Pagina<OperacionResumen>> {
    return this.http.get<Pagina<OperacionResumen>>(this.url('/operaciones'), {
      params: this.paginado(pagina, { numero: filtro.numero ?? '', identificacion: filtro.identificacion ?? '' }),
    });
  }

  operacionesDelCliente(identificacion: string, pagina: number): Observable<Pagina<OperacionCliente>> {
    return this.http.get<Pagina<OperacionCliente>>(this.url(`/clientes/${identificacion}/operaciones`), {
      params: this.paginado(pagina),
    });
  }

  detalleOperacion(numero: string): Observable<OperacionDetalle> {
    return this.http.get<OperacionDetalle>(this.url(`/operaciones/${numero}`));
  }

  tablaAmortizacion(numero: string): Observable<CuotaTabla[]> {
    return this.http.get<CuotaTabla[]>(this.url(`/operaciones/${numero}/tabla`));
  }

  pagosDeOperacion(numero: string, pagina: number): Observable<Pagina<PagoAplicado>> {
    return this.http.get<Pagina<PagoAplicado>>(this.url(`/operaciones/${numero}/pagos`), {
      params: this.paginado(pagina),
    });
  }

  cargosMora(numero: string): Observable<CargoMoraCuota[]> {
    return this.http.get<CargoMoraCuota[]>(this.url(`/operaciones/${numero}/cargos-mora`));
  }

  movimientosEstado(numero: string): Observable<MovimientoEstado[]> {
    return this.http.get<MovimientoEstado[]>(this.url(`/operaciones/${numero}/estados`));
  }

  simularAbono(numero: string, cuerpo: SolicitudAbono): Observable<CuadroAbono> {
    return this.http.post<CuadroAbono>(this.url(`/operaciones/${numero}/abonos/simulacion`), cuerpo);
  }

  registrarAbono(numero: string, cuerpo: SolicitudAbono, idAnalista: number): Observable<AbonoRegistrado> {
    return this.http.post<AbonoRegistrado>(this.url(`/operaciones/${numero}/abonos`), cuerpo, {
      headers: { idAnalista: String(idAnalista) },
    });
  }

  abonosDeOperacion(numero: string): Observable<ResumenAbono[]> {
    return this.http.get<ResumenAbono[]>(this.url(`/operaciones/${numero}/abonos`));
  }

  liquidacion(numero: string): Observable<Liquidacion> {
    return this.http.get<Liquidacion>(this.url(`/operaciones/${numero}/liquidacion`));
  }

  cancelar(numero: string, idAnalista: number): Observable<CancelacionRegistrada> {
    return this.http.post<CancelacionRegistrada>(this.url(`/operaciones/${numero}/cancelacion`), {}, {
      headers: { idAnalista: String(idAnalista) },
    });
  }

  iniciarCierre(): Observable<CierreRespuesta> {
    return this.http.post<CierreRespuesta>(this.url('/cierres'), {});
  }

  reintentarCierre(fecha: string): Observable<CierreRespuesta> {
    return this.http.post<CierreRespuesta>(this.url(`/cierres/${fecha}/reintento`), {});
  }

  listarCierres(desde?: string, hasta?: string): Observable<CierreRespuesta[]> {
    let params = new HttpParams();
    if (desde) {
      params = params.set('desde', desde);
    }
    if (hasta) {
      params = params.set('hasta', hasta);
    }
    return this.http.get<CierreRespuesta[]>(this.url('/cierres'), { params });
  }

  detalleCierre(fecha: string): Observable<CierreRespuesta> {
    return this.http.get<CierreRespuesta>(this.url(`/cierres/${fecha}`));
  }

  etapasCierre(fecha: string): Observable<EtapaCierreRespuesta[]> {
    return this.http.get<EtapaCierreRespuesta[]>(this.url(`/cierres/${fecha}/etapas`));
  }

  parametros(): Observable<Parametro[]> {
    return this.http.get<Parametro[]>(this.url('/parametros'));
  }

  parametrosProgramados(): Observable<Parametro[]> {
    return this.http.get<Parametro[]>(this.url('/parametros/programados'));
  }

  actualizarParametro(codigo: string, cuerpo: NuevoValorParametro): Observable<Parametro> {
    return this.http.put<Parametro>(this.url(`/parametros/${codigo}`), cuerpo);
  }

  tramosCartera(fecha?: string): Observable<TramoCartera[]> {
    return this.http.get<TramoCartera[]>(this.url('/tramos-cartera'), { params: fecha ? { fecha } : {} });
  }

  programarTramos(tramos: DatosTramo[], vigenteDesde: string): Observable<TramoCartera[]> {
    return this.http.put<TramoCartera[]>(this.url('/tramos-cartera'), tramos, { params: { vigenteDesde } });
  }

  reporteMorosidad(fechaCorte: string): Observable<ReporteMorosidad> {
    return this.http.get<ReporteMorosidad>(this.url('/reportes/morosidad'), { params: { fechaCorte } });
  }

  reporteComposicion(fechaCorte: string): Observable<ReporteComposicionTramos> {
    return this.http.get<ReporteComposicionTramos>(this.url('/reportes/composicion-tramos'), { params: { fechaCorte } });
  }

  reporteSalud(fechaCorte: string): Observable<ReporteSaludPortafolio> {
    return this.http.get<ReporteSaludPortafolio>(this.url('/reportes/salud-portafolio'), { params: { fechaCorte } });
  }

  reporteRollRate(fechaInicial: string, fechaFinal: string): Observable<ReporteRollRate> {
    return this.http.get<ReporteRollRate>(this.url('/reportes/roll-rate'), {
      params: { fechaInicial, fechaFinal },
    });
  }
}
