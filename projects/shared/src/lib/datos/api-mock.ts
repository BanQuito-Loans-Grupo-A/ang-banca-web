import { Injectable } from '@angular/core';
import { Observable, delay, map, of, throwError } from 'rxjs';
import { ApiBanquito } from './api';
import { FECHA_NEGOCIO_INICIAL, OPERACIONES, SOLICITUDES_BANDEJA, SOLICITUDES_CLIENTE } from './semilla';
import { simular as calcularSimulacion } from '../core/amortizacion';
import { redondear } from '../core/dinero';
import { sumarDias, sumarMeses } from '../core/fechas';
import { ErrorBanquito } from '../core/errores';
import {
  AbonoRegistrado, AprobacionSolicitud, CancelacionRegistrada, CargoMoraCuota, CierreRespuesta,
  CondicionesSimulador, CuadroAbono, CuotaTabla, DesembolsoSolicitud, EtapaCierreRespuesta,
  FechaNegocio, Liquidacion, MovimientoEstado, OperacionCliente, OperacionDetalle, OperacionResumen,
  Pagina, PagoAplicado, Parametro, RechazoSolicitud, RegistroSolicitud, ReporteComposicionTramos,
  ReporteMorosidad, ReporteRollRate, ReporteSaludPortafolio, ResolucionRespuesta, ResumenAbono,
  Simulacion, SolicitudAbono, SolicitudBandeja, SolicitudCliente, SolicitudDetalle,
  SolicitudRegistrada, SolicitudSimulacion, TramoCartera, ClienteIdentificado, AnalistaIdentificado,
} from '../core/modelos';

const RETARDO = 260;

function responder<T>(valor: T): Observable<T> {
  return of(valor).pipe(delay(RETARDO));
}

function paginar<T>(items: T[], pagina: number): Pagina<T> {
  const size = 20;
  const desde = pagina * size;
  return {
    content: items.slice(desde, desde + size),
    page: { size, number: pagina, totalElements: items.length, totalPages: Math.max(1, Math.ceil(items.length / size)) },
  };
}

@Injectable()
export class ApiMock extends ApiBanquito {
  private readonly bandeja = [...SOLICITUDES_BANDEJA];
  private readonly aprobadas: SolicitudBandeja[] = [];
  private readonly solicitudesCliente = [...SOLICITUDES_CLIENTE];
  private cierres: CierreRespuesta[] = [
    { fechaNegocio: sumarDias(FECHA_NEGOCIO_INICIAL, -1), estado: 'CERRADO', intentoCierre: 1, ultimaEtapaCompletada: 6, fechaHoraInicioCierre: '2026-10-30T23:00:00', fechaHoraFinCierre: '2026-10-30T23:00:42', duracionSegundos: 42, observacion: 'Cierre completo sin incidencias' },
    { fechaNegocio: sumarDias(FECHA_NEGOCIO_INICIAL, -2), estado: 'CERRADO', intentoCierre: 2, ultimaEtapaCompletada: 6, fechaHoraInicioCierre: '2026-10-29T23:00:00', fechaHoraFinCierre: '2026-10-29T23:01:11', duracionSegundos: 71, observacion: 'Reintento exitoso tras fallo en etapa 2' },
  ];

  condicionesProducto(): Observable<CondicionesSimulador> {
    return responder({
      montoMinimo: 500,
      montoMaximo: 30000,
      plazoMinimo: 6,
      plazoMaximo: 60,
      teaReferencial: 15.5,
      fechaNegocio: FECHA_NEGOCIO_INICIAL,
      sistemasAmortizacion: ['FRANCES', 'ALEMAN'],
    });
  }

  simular(peticion: SolicitudSimulacion): Observable<Simulacion> {
    if (peticion.monto < 500 || peticion.monto > 30000) {
      return throwError(() => new ErrorBanquito('El monto permitido va de USD 500,00 a USD 30.000,00', 'PETICION_INVALIDA', 400));
    }
    if (peticion.plazoMeses < 6 || peticion.plazoMeses > 60) {
      return throwError(() => new ErrorBanquito('El plazo permitido va de 6 a 60 meses', 'PETICION_INVALIDA', 400));
    }
    return responder(
      calcularSimulacion(peticion.monto, peticion.plazoMeses, 0.155, peticion.sistemaAmortizacion, FECHA_NEGOCIO_INICIAL),
    );
  }

  fechaNegocio(): Observable<FechaNegocio> {
    return responder({
      fechaNegocio: FECHA_NEGOCIO_INICIAL,
      estado: 'ABIERTO',
      ultimaFechaCerrada: sumarDias(FECHA_NEGOCIO_INICIAL, -1),
    });
  }

  identificarCliente(identificacion: string): Observable<ClienteIdentificado> {
    const encontrada = OPERACIONES.find(({ detalle }) => detalle.identificacionCliente === identificacion);
    const nombre = encontrada?.detalle.nombreCompletoCliente ?? 'Mariela Jácome Andrade';
    const [primero, ...resto] = nombre.split(' ');
    return responder({
      idCliente: 1,
      tipoIdentificacion: 'CEDULA',
      identificacion,
      nombre: primero,
      apellido: resto.join(' '),
      nombreCompleto: nombre,
      telefono: '0998765432',
      email: 'cliente@banquito.ec',
      estado: 'ACTIVO',
    });
  }

  identificarAnalista(identificacion: string): Observable<AnalistaIdentificado> {
    return responder({
      idAnalista: 1,
      tipoIdentificacion: 'CEDULA',
      identificacion,
      nombre: 'Bryan',
      apellido: 'Ortiz',
      nombreCompleto: 'Bryan Ortiz',
      estado: 'ACTIVO',
    });
  }

  registrarSolicitud(registro: RegistroSolicitud): Observable<SolicitudRegistrada> {
    const simulacion = calcularSimulacion(
      registro.montoSolicitado, registro.plazoMes, 0.155, registro.sistemaAmortizacion, FECHA_NEGOCIO_INICIAL,
    );
    const remanente = redondear(registro.ingresoMensual - registro.gastoMensual);
    const limite = redondear(remanente * 0.4);
    const cumple = remanente > 0 && simulacion.cuotaPrimera <= limite;
    const idSolicitud = 300 + this.solicitudesCliente.length;
    const registrada: SolicitudRegistrada = {
      idSolicitud,
      identificacion: registro.identificacion,
      numeroCuentaDesembolso: registro.numeroCuentaDesembolso,
      montoSolicitado: registro.montoSolicitado,
      plazoMes: registro.plazoMes,
      sistemaAmortizacion: registro.sistemaAmortizacion,
      destino: registro.destino,
      estado: cumple ? 'REGISTRADA' : 'RECHAZADA',
      motivoRechazo: cumple ? null : `La cuota proyectada de USD ${simulacion.cuotaPrimera.toFixed(2)} supera la cuota máxima admisible de USD ${limite.toFixed(2)}`,
      fechaHoraRegistro: `${FECHA_NEGOCIO_INICIAL}T09:00:00`,
      evaluacionReferencial: {
        idEvaluacionCapacidad: idSolicitud,
        idSolicitud,
        idAnalista: null,
        idDiaNegocio: 1,
        tipoEvaluacion: 'REFERENCIAL',
        teaUtilizada: 15.5,
        remanenteMensual: remanente,
        cuotaMaximaAdmisible: limite,
        cuotaProyectada: simulacion.cuotaPrimera,
        cumple,
      },
    };
    this.solicitudesCliente.unshift({
      idSolicitud,
      montoSolicitado: registro.montoSolicitado,
      plazoMes: registro.plazoMes,
      sistemaAmortizacion: registro.sistemaAmortizacion,
      destino: registro.destino,
      estado: registrada.estado,
      teaAsignada: null,
      motivoRechazo: registrada.motivoRechazo,
      fechaHoraRegistro: registrada.fechaHoraRegistro,
      fechaHoraResolucion: cumple ? null : registrada.fechaHoraRegistro,
    });
    return responder(registrada);
  }

  solicitudesDelCliente(identificacion: string, pagina: number): Observable<Pagina<SolicitudCliente>> {
    return responder(paginar(this.solicitudesCliente, pagina));
  }

  bandejaSolicitudes(estado: string, pagina: number): Observable<Pagina<SolicitudBandeja>> {
    return responder(paginar(estado === 'APROBADA' ? this.aprobadas : this.bandeja, pagina));
  }

  detalleSolicitud(idSolicitud: number): Observable<SolicitudDetalle> {
    const fila = this.bandeja.find((item) => item.idSolicitud === idSolicitud) ?? this.bandeja[0];
    return responder({
      solicitud: {
        idSolicitud: fila.idSolicitud,
        idCliente: 1,
        identificacionCliente: fila.identificacionCliente,
        nombreCompletoCliente: fila.nombreCompletoCliente,
        numeroCuentaDesembolso: '2200145879',
        montoSolicitado: fila.montoSolicitado,
        plazoMes: fila.plazoMes,
        sistemaAmortizacion: fila.sistemaAmortizacion,
        destino: fila.destino,
        ingresoMensual: fila.ingresoMensual,
        gastoMensual: fila.gastoMensual,
        estado: 'REGISTRADA',
        teaAsignada: null,
        motivoRechazo: null,
        idAnalista: null,
        fechaHoraRegistro: fila.fechaHoraRegistro,
        fechaHoraResolucion: null,
      },
      evaluaciones: [
        {
          idEvaluacionCapacidad: fila.idSolicitud,
          idSolicitud: fila.idSolicitud,
          idAnalista: null,
          idDiaNegocio: 1,
          tipoEvaluacion: 'REFERENCIAL',
          teaUtilizada: 15.5,
          remanenteMensual: fila.remanenteMensual,
          cuotaMaximaAdmisible: fila.cuotaMaximaAdmisible,
          cuotaProyectada: fila.cuotaProyectada,
          cumple: fila.cuotaProyectada <= fila.cuotaMaximaAdmisible,
        },
      ],
    });
  }

  aprobarSolicitud(idSolicitud: number, cuerpo: AprobacionSolicitud): Observable<ResolucionRespuesta> {
    if (cuerpo.tea > 16.77) {
      return throwError(() => new ErrorBanquito('La TEA asignada supera la TEA máxima vigente de 16,77 %', 'PETICION_INVALIDA', 422));
    }
    const fila = this.bandeja.find((item) => item.idSolicitud === idSolicitud);
    if (fila) {
      this.bandeja.splice(this.bandeja.indexOf(fila), 1);
      this.aprobadas.push(fila);
    }
    return responder({
      idSolicitud,
      estado: 'APROBADA',
      teaAsignada: cuerpo.tea,
      tasaNominalAnual: redondear(12 * (Math.pow(1 + cuerpo.tea / 100, 1 / 12) - 1) * 10000) / 100,
      tasaMensual: redondear((Math.pow(1 + cuerpo.tea / 100, 1 / 12) - 1) * 10000) / 100,
      motivoRechazo: null,
      idAnalista: cuerpo.idAnalista,
      fechaHoraResolucion: `${FECHA_NEGOCIO_INICIAL}T10:30:00`,
      evaluacionDefinitiva: null,
    });
  }

  rechazarSolicitud(idSolicitud: number, cuerpo: RechazoSolicitud): Observable<ResolucionRespuesta> {
    const fila = this.bandeja.find((item) => item.idSolicitud === idSolicitud);
    if (fila) {
      this.bandeja.splice(this.bandeja.indexOf(fila), 1);
    }
    return responder({
      idSolicitud,
      estado: 'RECHAZADA',
      teaAsignada: null,
      tasaNominalAnual: null,
      tasaMensual: null,
      motivoRechazo: cuerpo.motivo,
      idAnalista: cuerpo.idAnalista,
      fechaHoraResolucion: `${FECHA_NEGOCIO_INICIAL}T10:30:00`,
      evaluacionDefinitiva: null,
    });
  }

  desembolsar(cuerpo: DesembolsoSolicitud): Observable<OperacionDetalle> {
    const fila = this.aprobadas.find((item) => item.idSolicitud === cuerpo.solicitudId);
    if (fila) {
      this.aprobadas.splice(this.aprobadas.indexOf(fila), 1);
    }
    return responder(OPERACIONES[0].detalle);
  }

  buscarOperaciones(filtro: { numero?: string; identificacion?: string }, pagina: number): Observable<Pagina<OperacionResumen>> {
    const texto = (filtro.numero ?? filtro.identificacion ?? '').toLowerCase();
    const filas = OPERACIONES.map(({ detalle }) => ({
      idPrestamo: detalle.idPrestamo,
      numeroPrestamo: detalle.numeroPrestamo,
      identificacionCliente: detalle.identificacionCliente,
      nombreCompletoCliente: detalle.nombreCompletoCliente,
      sistemaAmortizacion: detalle.sistemaAmortizacion,
      montoAprobado: detalle.montoAprobado,
      saldoCapital: detalle.saldoCapital,
      estado: detalle.estado,
      diaMora: detalle.diaMora,
      fechaDesembolso: detalle.fechaDesembolso,
    })).filter((fila) =>
      !texto ||
      fila.numeroPrestamo.toLowerCase().includes(texto) ||
      fila.identificacionCliente.includes(texto) ||
      fila.nombreCompletoCliente.toLowerCase().includes(texto),
    );
    return responder(paginar(filas, pagina));
  }

  operacionesDelCliente(identificacion: string, pagina: number): Observable<Pagina<OperacionCliente>> {
    const filas: OperacionCliente[] = OPERACIONES.filter(({ detalle }) => detalle.identificacionCliente === identificacion)
      .map(({ detalle, cuotas }) => {
        const proxima = cuotas.find((cuota) => cuota.estado !== 'PAGADA');
        return {
          numeroPrestamo: detalle.numeroPrestamo,
          sistemaAmortizacion: detalle.sistemaAmortizacion,
          montoAprobado: detalle.montoAprobado,
          saldoCapital: detalle.saldoCapital,
          fechaProximoVencimiento: proxima?.fechaVencimiento ?? null,
          valorProximaCuota: proxima?.cuotaTotal ?? null,
          estado: detalle.estado,
          diaMora: detalle.diaMora,
        };
      });
    return responder(paginar(filas.length ? filas : OPERACIONES.slice(0, 2).map(({ detalle, cuotas }) => {
      const proxima = cuotas.find((cuota) => cuota.estado !== 'PAGADA');
      return {
        numeroPrestamo: detalle.numeroPrestamo,
        sistemaAmortizacion: detalle.sistemaAmortizacion,
        montoAprobado: detalle.montoAprobado,
        saldoCapital: detalle.saldoCapital,
        fechaProximoVencimiento: proxima?.fechaVencimiento ?? null,
        valorProximaCuota: proxima?.cuotaTotal ?? null,
        estado: detalle.estado,
        diaMora: detalle.diaMora,
      };
    }), pagina));
  }

  detalleOperacion(numero: string): Observable<OperacionDetalle> {
    const encontrada = OPERACIONES.find(({ detalle }) => detalle.numeroPrestamo === numero);
    if (!encontrada) {
      return throwError(() => new ErrorBanquito('La operación no existe', 'RECURSO_NO_ENCONTRADO', 404));
    }
    return responder(encontrada.detalle);
  }

  tablaAmortizacion(numero: string): Observable<CuotaTabla[]> {
    const encontrada = OPERACIONES.find(({ detalle }) => detalle.numeroPrestamo === numero);
    return responder(encontrada ? encontrada.cuotas : []);
  }

  pagosDeOperacion(numero: string, pagina: number): Observable<Pagina<PagoAplicado>> {
    const encontrada = OPERACIONES.find(({ detalle }) => detalle.numeroPrestamo === numero);
    const pagos: PagoAplicado[] = (encontrada?.cuotas ?? [])
      .filter((cuota) => cuota.estado !== 'PENDIENTE')
      .map((cuota, indice) => ({
        idPago: indice + 1,
        idDiaNegocio: indice + 1,
        tipoPago: 'RECAUDACION',
        montoRecibido: redondear(cuota.capitalPagado + cuota.interesPagado + cuota.seguroPagado),
        aplicadoSeguro: cuota.seguroPagado,
        aplicadoMora: cuota.moraPagada,
        aplicadoInteres: cuota.interesPagado,
        aplicadoCapital: cuota.capitalPagado,
        aplicadoAnticipado: 0,
        excedenteDevolver: 0,
        esRecuperacion: false,
      }));
    return responder(paginar(pagos, pagina));
  }

  cargosMora(numero: string): Observable<CargoMoraCuota[]> {
    const encontrada = OPERACIONES.find(({ detalle }) => detalle.numeroPrestamo === numero);
    const cargos: CargoMoraCuota[] = (encontrada?.cuotas ?? [])
      .filter((cuota) => cuota.moraAcumulada > 0)
      .map((cuota) => ({
        idCuota: cuota.idCuota,
        numeroCuota: cuota.numeroCuota,
        fechaVencimiento: cuota.fechaVencimiento,
        moraAcumulada: cuota.moraAcumulada,
        moraPagada: cuota.moraPagada,
        moraPendiente: redondear(cuota.moraAcumulada - cuota.moraPagada),
      }));
    return responder(cargos);
  }

  movimientosEstado(numero: string): Observable<MovimientoEstado[]> {
    const encontrada = OPERACIONES.find(({ detalle }) => detalle.numeroPrestamo === numero);
    if (!encontrada || encontrada.detalle.diaMora === 0) {
      return responder([]);
    }
    return responder([
      { idDiaNegocio: 1, estadoAnterior: null, estadoNuevo: 'POR_VENCER', diaMora: 0, fechaHoraRegistro: `${encontrada.detalle.fechaDesembolso}T18:00:00` },
      { idDiaNegocio: 2, estadoAnterior: 'POR_VENCER', estadoNuevo: encontrada.detalle.estado, diaMora: encontrada.detalle.diaMora, fechaHoraRegistro: `${sumarDias(FECHA_NEGOCIO_INICIAL, -1)}T23:00:00` },
    ]);
  }

  simularAbono(numero: string, cuerpo: SolicitudAbono): Observable<CuadroAbono> {
    const encontrada = OPERACIONES.find(({ detalle }) => detalle.numeroPrestamo === numero);
    if (!encontrada) {
      return throwError(() => new ErrorBanquito('La operación no existe', 'RECURSO_NO_ENCONTRADO', 404));
    }
    if (cuerpo.monto < 50) {
      return throwError(() => new ErrorBanquito('El abono mínimo es de USD 50,00', 'PETICION_INVALIDA', 422));
    }
    if (encontrada.detalle.diaMora > 0) {
      return throwError(
        () =>
          new ErrorBanquito(
            'La operación tiene cuotas vencidas. El recálculo del abono extraordinario exige estar al día; use el simulador de pagos.',
            'ABONO_CON_CUOTAS_VENCIDAS',
            422,
          ),
      );
    }
    const detalle = encontrada.detalle;
    const interesLiquidado = redondear((detalle.saldoCapital * (detalle.tasaNominalAnual / 100) * 15) / 360);
    const capitalAbonado = redondear(cuerpo.monto - interesLiquidado);
    const nuevoSaldo = redondear(detalle.saldoCapital - capitalAbonado);
    const pendientes = encontrada.cuotas.filter((cuota) => cuota.estado !== 'PAGADA');
    const nuevoPlazo = cuerpo.modalidad === 'REDUCIR_PLAZO'
      ? Math.max(1, pendientes.length - 2)
      : pendientes.length;
    const cuotas = pendientes.slice(0, nuevoPlazo).map((cuota, indice) => ({
      numero: cuota.numeroCuota,
      fechaVencimiento: cuota.fechaVencimiento,
      capital: redondear(nuevoSaldo / nuevoPlazo),
      interes: redondear((nuevoSaldo / nuevoPlazo) * 0.013 * (nuevoPlazo - indice)),
      seguro: detalle.seguroMensual,
      cuotaTotal: 0,
      saldoCapitalPosterior: redondear(nuevoSaldo - (nuevoSaldo / nuevoPlazo) * (indice + 1)),
    })).map((fila) => ({ ...fila, cuotaTotal: redondear(fila.capital + fila.interes + fila.seguro) }));
    return responder({
      numeroOperacion: numero,
      fechaAbono: FECHA_NEGOCIO_INICIAL,
      modalidad: cuerpo.modalidad,
      montoAbono: cuerpo.monto,
      interesLiquidado,
      capitalAbonado,
      saldoAnterior: detalle.saldoCapital,
      nuevoSaldo,
      cuotasRestantes: nuevoPlazo,
      nuevoPlazo,
      fechaUltimaCuota: sumarMeses(FECHA_NEGOCIO_INICIAL, nuevoPlazo),
      totalIntereses: redondear(cuotas.reduce((total, fila) => total + fila.interes, 0)),
      cuotas,
    });
  }

  registrarAbono(numero: string, cuerpo: SolicitudAbono, idAnalista: number): Observable<AbonoRegistrado> {
    const encontrada = OPERACIONES.find(({ detalle }) => detalle.numeroPrestamo === numero);
    if (encontrada && encontrada.detalle.diaMora > 0) {
      return responder({
        idPago: Date.now(),
        tratamiento: 'PAGO_POR_PRELACION',
        cuadro: null,
        pagoPorPrelacion: {
          idPago: Date.now(),
          monto: cuerpo.monto,
          aplicadoSeguro: 6,
          aplicadoMora: redondear(cuerpo.monto * 0.02),
          aplicadoInteres: redondear(cuerpo.monto * 0.14),
          aplicadoCapital: redondear(cuerpo.monto * 0.84 - 6),
          operacionCancelada: false,
        },
      });
    }
    return this.simularAbono(numero, cuerpo).pipe(
      map((cuadro) => ({
        idPago: Date.now(),
        tratamiento: 'ABONO_EXTRAORDINARIO' as const,
        cuadro,
        pagoPorPrelacion: null,
      })),
    );
  }

  abonosDeOperacion(numero: string): Observable<ResumenAbono[]> {
    return responder([]);
  }

  liquidacion(numero: string): Observable<Liquidacion> {
    const encontrada = OPERACIONES.find(({ detalle }) => detalle.numeroPrestamo === numero);
    if (!encontrada) {
      return throwError(() => new ErrorBanquito('La operación no existe', 'RECURSO_NO_ENCONTRADO', 404));
    }
    const detalle = encontrada.detalle;
    const moraVencida = redondear(encontrada.cuotas.reduce((total, cuota) => total + cuota.moraAcumulada, 0));
    const interesCuotaEnCurso = redondear((detalle.saldoCapital * (detalle.tasaNominalAnual / 100) * 12) / 360);
    const vencidas = encontrada.cuotas.filter((cuota) => cuota.estado !== 'PAGADA' && cuota.fechaVencimiento <= FECHA_NEGOCIO_INICIAL);
    const interesesVencidos = redondear(vencidas.reduce((total, cuota) => total + cuota.interes - cuota.interesPagado, 0));
    const segurosVencidos = redondear(vencidas.reduce((total, cuota) => total + cuota.seguro - cuota.seguroPagado, 0));
    return responder({
      numeroOperacion: numero,
      fechaCorte: FECHA_NEGOCIO_INICIAL,
      capitalInsoluto: detalle.saldoCapital,
      interesesVencidos,
      interesCuotaEnCurso,
      segurosVencidos,
      moraVencida,
      valorCancelacion: redondear(detalle.saldoCapital + interesesVencidos + interesCuotaEnCurso + segurosVencidos + moraVencida),
    });
  }

  cancelar(numero: string, idAnalista: number): Observable<CancelacionRegistrada> {
    return this.liquidacion(numero).pipe(map((liquidacion) => ({ idPago: Date.now(), liquidacion })));
  }

  iniciarCierre(): Observable<CierreRespuesta> {
    const nuevo: CierreRespuesta = {
      fechaNegocio: FECHA_NEGOCIO_INICIAL,
      estado: 'CERRADO',
      intentoCierre: 1,
      ultimaEtapaCompletada: 6,
      fechaHoraInicioCierre: `${FECHA_NEGOCIO_INICIAL}T23:00:00`,
      fechaHoraFinCierre: `${FECHA_NEGOCIO_INICIAL}T23:00:38`,
      duracionSegundos: 38,
      observacion: '5 operaciones castigadas, 300 registros de recaudación aplicados',
    };
    this.cierres = [nuevo, ...this.cierres];
    return responder(nuevo);
  }

  reintentarCierre(fecha: string): Observable<CierreRespuesta> {
    return this.iniciarCierre();
  }

  listarCierres(): Observable<CierreRespuesta[]> {
    return responder(this.cierres);
  }

  detalleCierre(fecha: string): Observable<CierreRespuesta> {
    const encontrado = this.cierres.find((cierre) => cierre.fechaNegocio === fecha);
    return encontrado
      ? responder(encontrado)
      : throwError(() => new ErrorBanquito('No hay cierre para esa fecha', 'RECURSO_NO_ENCONTRADO', 404));
  }

  etapasCierre(fecha: string): Observable<EtapaCierreRespuesta[]> {
    const etapas: EtapaCierreRespuesta[] = [
      [1, 'Recaudaciones', 8400, '300 registros, 298 aplicados, 2 duplicados'],
      [2, 'Devengos', 3100, '94 operaciones devengadas'],
      [3, 'Mora', 2200, '40 cuotas con cargo de mora'],
      [4, 'Clasificación de cartera', 1900, '7 cambios de tramo'],
      [5, 'Provisiones, castigo y cuadre', 12400, '5 operaciones castigadas, débitos = créditos'],
      [6, 'Fotografía de cartera', 9800, '100 fotografías guardadas'],
    ].map(([numeroEtapa, descripcion, duracion, observacion]) => ({
      numeroEtapa: numeroEtapa as number,
      intento: 1,
      estado: 'EXITOSA',
      fechaHoraInicio: `${fecha}T23:00:00`,
      fechaHoraFin: `${fecha}T23:00:10`,
      duracionMilisegundos: duracion as number,
      observacion: `${descripcion}: ${observacion}`,
    }));
    return responder(etapas);
  }

  parametros(): Observable<Parametro[]> {
    const filas: Array<[string, string, number]> = [
      ['PAR-01', 'Monto mínimo del crédito', 500],
      ['PAR-02', 'Monto máximo del crédito', 30000],
      ['PAR-03', 'Plazo mínimo en meses', 6],
      ['PAR-04', 'Plazo máximo en meses', 60],
      ['PAR-05', 'TEA máxima del segmento de consumo', 16.77],
      ['PAR-06', 'TEA referencial de simulación', 15.5],
      ['PAR-07', 'Factor mensual del seguro de desgravamen', 0.06],
      ['PAR-08', 'Contribución SOLCA', 0.5],
      ['PAR-09', 'Límite de cuota sobre el remanente', 40],
      ['PAR-10', 'Factor de mora', 1.1],
      ['PAR-11', 'Base de cálculo de intereses', 360],
      ['PAR-12', 'Valor mínimo de abono extraordinario', 50],
    ];
    return responder(filas.map(([codigo, nombre, valorNumerico]) => ({
      codigo, nombre, valorNumerico, valorFecha: null, vigenteDesde: '2026-10-01',
    })));
  }

  tramosCartera(): Observable<TramoCartera[]> {
    const filas: TramoCartera[] = [
      { numeroTramo: 1, diaMoraMinimo: 0, estadoCartera: 'POR_VENCER', devengaEnResultado: true, acumulaMora: false, porcentajeProvision: 1, vigenteDesde: '2026-10-01' },
      { numeroTramo: 2, diaMoraMinimo: 1, estadoCartera: 'VENCIDA', devengaEnResultado: true, acumulaMora: true, porcentajeProvision: 5, vigenteDesde: '2026-10-01' },
      { numeroTramo: 3, diaMoraMinimo: 31, estadoCartera: 'VENCIDA', devengaEnResultado: true, acumulaMora: true, porcentajeProvision: 25, vigenteDesde: '2026-10-01' },
      { numeroTramo: 4, diaMoraMinimo: 91, estadoCartera: 'EN_LITIGIO', devengaEnResultado: false, acumulaMora: true, porcentajeProvision: 60, vigenteDesde: '2026-10-01' },
      { numeroTramo: 5, diaMoraMinimo: 181, estadoCartera: 'CASTIGADA', devengaEnResultado: false, acumulaMora: false, porcentajeProvision: 100, vigenteDesde: '2026-10-01' },
    ];
    return responder(filas);
  }

  reporteMorosidad(fechaCorte: string): Observable<ReporteMorosidad> {
    const vivas = OPERACIONES.filter(({ detalle }) => detalle.estado !== 'CANCELADA' && detalle.estado !== 'CASTIGADA');
    const saldoVencida = redondear(vivas.filter(({ detalle }) => detalle.estado === 'VENCIDA').reduce((t, { detalle }) => t + detalle.saldoCapital, 0));
    const saldoEnLitigio = redondear(vivas.filter(({ detalle }) => detalle.estado === 'EN_LITIGIO').reduce((t, { detalle }) => t + detalle.saldoCapital, 0));
    const carteraBruta = redondear(vivas.reduce((t, { detalle }) => t + detalle.saldoCapital, 0));
    const saldoCastigada = redondear(OPERACIONES.filter(({ detalle }) => detalle.estado === 'CASTIGADA').reduce((t, { detalle }) => t + detalle.saldoCapital, 0));
    return responder({
      fechaCorte,
      saldoVencida,
      saldoEnLitigio,
      saldoVencidaYEnLitigio: redondear(saldoVencida + saldoEnLitigio),
      carteraBruta,
      indiceMorosidad: carteraBruta ? redondear(((saldoVencida + saldoEnLitigio) / carteraBruta) * 10000) / 100 : 0,
      saldoCastigada,
    });
  }

  reporteComposicion(fechaCorte: string): Observable<ReporteComposicionTramos> {
    const definicion: Array<[number, string, (dia: number, estado: string) => boolean, number]> = [
      [1, 'POR_VENCER', (dia, estado) => estado === 'POR_VENCER', 1],
      [2, 'VENCIDA', (dia, estado) => estado === 'VENCIDA' && dia <= 30, 5],
      [3, 'VENCIDA', (dia, estado) => estado === 'VENCIDA' && dia > 30, 25],
      [4, 'EN_LITIGIO', (dia, estado) => estado === 'EN_LITIGIO', 60],
      [5, 'CASTIGADA', (dia, estado) => estado === 'CASTIGADA', 100],
    ];
    const vivas = OPERACIONES.filter(({ detalle }) => detalle.estado !== 'CANCELADA');
    const total = redondear(vivas.reduce((t, { detalle }) => t + detalle.saldoCapital, 0));
    const tramos = definicion.map(([numeroTramo, estadoCartera, coincide, porcentaje]) => {
      const filas = vivas.filter(({ detalle }) => coincide(detalle.diaMora, detalle.estado));
      const saldoCapital = redondear(filas.reduce((t, { detalle }) => t + detalle.saldoCapital, 0));
      return {
        numeroTramo,
        estadoCartera,
        operaciones: filas.length,
        saldoCapital,
        porcentajeSaldo: total ? redondear((saldoCapital / total) * 10000) / 100 : 0,
        provision: redondear((saldoCapital * porcentaje) / 100),
      };
    });
    return responder({
      fechaCorte,
      tramos,
      total: {
        operaciones: tramos.reduce((t, fila) => t + fila.operaciones, 0),
        saldoCapital: total,
        porcentajeSaldo: 100,
        provision: redondear(tramos.reduce((t, fila) => t + fila.provision, 0)),
      },
    });
  }

  reporteSalud(fechaCorte: string): Observable<ReporteSaludPortafolio> {
    const vivas = OPERACIONES.filter(({ detalle }) => detalle.estado !== 'CANCELADA' && detalle.estado !== 'CASTIGADA');
    const total = redondear(vivas.reduce((t, { detalle }) => t + detalle.saldoCapital, 0));
    const agrupar = (clave: (detalle: OperacionDetalle) => string) => {
      const mapa = new Map<string, { operaciones: number; saldo: number }>();
      for (const { detalle } of vivas) {
        const k = clave(detalle);
        const actual = mapa.get(k) ?? { operaciones: 0, saldo: 0 };
        mapa.set(k, { operaciones: actual.operaciones + 1, saldo: actual.saldo + detalle.saldoCapital });
      }
      return [...mapa.entries()].map(([categoria, valor]) => ({
        categoria,
        operaciones: valor.operaciones,
        saldoCapital: redondear(valor.saldo),
        porcentajeSaldo: total ? redondear((valor.saldo / total) * 10000) / 100 : 0,
      }));
    };
    const enMora = redondear(vivas.filter(({ detalle }) => detalle.diaMora > 0).reduce((t, { detalle }) => t + detalle.saldoCapital, 0));
    const provisiones = redondear(vivas.reduce((t, { detalle }) => t + detalle.provision, 0));
    return responder({
      fechaCorte,
      indiceMorosidad: total ? redondear((enMora / total) * 10000) / 100 : 0,
      coberturaProvisiones: enMora ? redondear((provisiones / enMora) * 10000) / 100 : 0,
      concentracionDiezMayores: 78.4,
      distribucionPorMonto: agrupar((detalle) =>
        detalle.montoAprobado <= 2000 ? 'Hasta USD 2.000' : detalle.montoAprobado <= 10000 ? 'USD 2.001 a 10.000' : 'USD 10.001 a 30.000'),
      distribucionPorPlazo: agrupar((detalle) =>
        detalle.plazoMes <= 12 ? 'Hasta 12 meses' : detalle.plazoMes <= 36 ? '13 a 36 meses' : '37 a 60 meses'),
      distribucionPorSistema: agrupar((detalle) => (detalle.sistemaAmortizacion === 'FRANCES' ? 'Francés' : 'Alemán')),
    });
  }

  reporteRollRate(fechaInicial: string, fechaFinal: string): Observable<ReporteRollRate> {
    return responder({
      fechaInicial,
      fechaFinal,
      filas: [
        { tramoInicial: 1, operaciones: 60, saldoInicial: 412500, destinos: [{ destino: 'TRAMO_1', evolucion: 'SE_MANTUVO', operaciones: 1, saldoInicial: 390000, porcentajeSaldo: 94.55 }, { destino: 'TRAMO_2', evolucion: 'EMPEORO', operaciones: 1, saldoInicial: 14500, porcentajeSaldo: 3.52 }, { destino: 'CANCELADA', evolucion: 'CANCELADA', operaciones: 1, saldoInicial: 8000, porcentajeSaldo: 1.93 }] },
        { tramoInicial: 2, operaciones: 15, saldoInicial: 96200, destinos: [{ destino: 'TRAMO_1', evolucion: 'MEJORO', operaciones: 1, saldoInicial: 28000, porcentajeSaldo: 29.11 }, { destino: 'TRAMO_2', evolucion: 'SE_MANTUVO', operaciones: 1, saldoInicial: 51200, porcentajeSaldo: 53.22 }, { destino: 'TRAMO_3', evolucion: 'EMPEORO', operaciones: 1, saldoInicial: 17000, porcentajeSaldo: 17.67 }] },
        { tramoInicial: 3, operaciones: 10, saldoInicial: 74800, destinos: [{ destino: 'TRAMO_2', evolucion: 'MEJORO', operaciones: 1, saldoInicial: 9800, porcentajeSaldo: 13.10 }, { destino: 'TRAMO_3', evolucion: 'SE_MANTUVO', operaciones: 1, saldoInicial: 48000, porcentajeSaldo: 64.17 }, { destino: 'TRAMO_4', evolucion: 'EMPEORO', operaciones: 1, saldoInicial: 17000, porcentajeSaldo: 22.73 }] },
        { tramoInicial: 4, operaciones: 10, saldoInicial: 61300, destinos: [{ destino: 'TRAMO_4', evolucion: 'SE_MANTUVO', operaciones: 1, saldoInicial: 44300, porcentajeSaldo: 72.27 }, { destino: 'TRAMO_5', evolucion: 'EMPEORO', operaciones: 1, saldoInicial: 17000, porcentajeSaldo: 27.73 }] },
      ],
    });
  }
}
