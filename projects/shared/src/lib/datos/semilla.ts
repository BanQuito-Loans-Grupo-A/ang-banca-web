import { generarTabla, seguroMensual, contribucionSolca, tasaMensualDesdeTea, tasaNominalDesdeTea } from '../core/amortizacion';
import { redondear, restar } from '../core/dinero';
import { sumarDias, sumarMeses } from '../core/fechas';
import {
  CuotaTabla, EstadoPrestamo, OperacionDetalle, SistemaAmortizacion, SolicitudBandeja, SolicitudCliente,
} from '../core/modelos';

export const FECHA_NEGOCIO_INICIAL = '2026-10-31';

interface Plantilla {
  numero: string;
  identificacion: string;
  nombre: string;
  cuenta: string;
  monto: number;
  plazo: number;
  tea: number;
  sistema: SistemaAmortizacion;
  mesesDesdeDesembolso: number;
  diaMora: number;
  estado: EstadoPrestamo;
}

const PLANTILLAS: Plantilla[] = [
  { numero: 'PR-000001', identificacion: '0213732191', nombre: 'Mariela Jácome Andrade', cuenta: '2200145879', monto: 10000, plazo: 12, tea: 0.1677, sistema: 'FRANCES', mesesDesdeDesembolso: 0, diaMora: 0, estado: 'POR_VENCER' },
  { numero: 'PR-000002', identificacion: '1104556677', nombre: 'Esteban Carrión Vega', cuenta: '2200145880', monto: 7500, plazo: 24, tea: 0.1540, sistema: 'FRANCES', mesesDesdeDesembolso: 6, diaMora: 0, estado: 'POR_VENCER' },
  { numero: 'PR-000003', identificacion: '0912334455', nombre: 'Lucía Montalvo Ponce', cuenta: '2200145881', monto: 15000, plazo: 36, tea: 0.1620, sistema: 'ALEMAN', mesesDesdeDesembolso: 9, diaMora: 12, estado: 'VENCIDA' },
  { numero: 'PR-000004', identificacion: '1723998877', nombre: 'Andrés Villacís Ruiz', cuenta: '2200145882', monto: 3200, plazo: 18, tea: 0.1655, sistema: 'FRANCES', mesesDesdeDesembolso: 7, diaMora: 30, estado: 'VENCIDA' },
  { numero: 'PR-000005', identificacion: '0604112233', nombre: 'Gabriela Suárez Mena', cuenta: '2200145883', monto: 22000, plazo: 48, tea: 0.1590, sistema: 'FRANCES', mesesDesdeDesembolso: 14, diaMora: 31, estado: 'VENCIDA' },
  { numero: 'PR-000006', identificacion: '1310445566', nombre: 'Jorge Zambrano Loor', cuenta: '2200145884', monto: 5400, plazo: 24, tea: 0.1677, sistema: 'ALEMAN', mesesDesdeDesembolso: 11, diaMora: 64, estado: 'VENCIDA' },
  { numero: 'PR-000007', identificacion: '1719887766', nombre: 'Paulina Nájera Cueva', cuenta: '2200145885', monto: 9800, plazo: 30, tea: 0.1601, sistema: 'FRANCES', mesesDesdeDesembolso: 15, diaMora: 90, estado: 'VENCIDA' },
  { numero: 'PR-000008', identificacion: '0105667788', nombre: 'Marco Tapia Ordóñez', cuenta: '2200145886', monto: 12500, plazo: 36, tea: 0.1650, sistema: 'FRANCES', mesesDesdeDesembolso: 18, diaMora: 91, estado: 'EN_LITIGIO' },
  { numero: 'PR-000009', identificacion: '1204337788', nombre: 'Silvia Erazo Benítez', cuenta: '2200145887', monto: 2800, plazo: 12, tea: 0.1500, sistema: 'ALEMAN', mesesDesdeDesembolso: 16, diaMora: 150, estado: 'EN_LITIGIO' },
  { numero: 'PR-000010', identificacion: '1718004455', nombre: 'Rubén Paredes Salas', cuenta: '2200145888', monto: 18000, plazo: 60, tea: 0.1677, sistema: 'FRANCES', mesesDesdeDesembolso: 24, diaMora: 180, estado: 'EN_LITIGIO' },
  { numero: 'PR-000011', identificacion: '0923118899', nombre: 'Daniela Guerrero Lima', cuenta: '2200145889', monto: 6200, plazo: 24, tea: 0.1620, sistema: 'FRANCES', mesesDesdeDesembolso: 22, diaMora: 181, estado: 'CASTIGADA' },
  { numero: 'PR-000012', identificacion: '1716553322', nombre: 'Fernando Chiriboga Rea', cuenta: '2200145890', monto: 4500, plazo: 18, tea: 0.1480, sistema: 'FRANCES', mesesDesdeDesembolso: 18, diaMora: 0, estado: 'CANCELADA' },
];

function fechaDesembolso(meses: number): string {
  return sumarMeses(FECHA_NEGOCIO_INICIAL, -meses);
}

function construirCuotas(plantilla: Plantilla): CuotaTabla[] {
  const desembolso = fechaDesembolso(plantilla.mesesDesdeDesembolso);
  const base = generarTabla(plantilla.monto, plantilla.plazo, plantilla.tea, plantilla.sistema, desembolso);
  const cancelada = plantilla.estado === 'CANCELADA';
  const limiteMora = plantilla.diaMora > 0 ? sumarDias(FECHA_NEGOCIO_INICIAL, -plantilla.diaMora) : FECHA_NEGOCIO_INICIAL;

  return base.map((cuota, indice) => {
    const vencida = cuota.fechaVencimiento <= FECHA_NEGOCIO_INICIAL;
    const impaga = plantilla.diaMora > 0 && cuota.fechaVencimiento >= limiteMora;
    const pagada = cancelada || (vencida && !impaga);
    const parcial = !pagada && impaga && indice % 4 === 1;
    const mora = impaga && !cancelada
      ? redondear((cuota.capital * tasaNominalDesdeTea(plantilla.tea) * 1.1 * plantilla.diaMora) / 360)
      : 0;
    return {
      idCuota: indice + 1,
      numeroCuota: cuota.numero,
      fechaVencimiento: cuota.fechaVencimiento,
      capital: cuota.capital,
      interes: cuota.interes,
      seguro: cuota.seguro,
      cuotaTotal: cuota.cuotaTotal,
      saldoCapitalPosterior: cuota.saldoCapitalPosterior,
      estado: pagada ? 'PAGADA' : parcial ? 'PAGO_PARCIAL' : 'PENDIENTE',
      capitalPagado: pagada ? cuota.capital : parcial ? redondear(cuota.capital / 2) : 0,
      interesPagado: pagada ? cuota.interes : parcial ? cuota.interes : 0,
      seguroPagado: pagada || parcial ? cuota.seguro : 0,
      moraAcumulada: mora,
      moraPagada: 0,
      fechaPago: pagada ? cuota.fechaVencimiento : null,
    } satisfies CuotaTabla;
  });
}

function construirOperacion(plantilla: Plantilla, indice: number): { detalle: OperacionDetalle; cuotas: CuotaTabla[] } {
  const cuotas = construirCuotas(plantilla);
  const desembolso = fechaDesembolso(plantilla.mesesDesdeDesembolso);
  const pendientes = cuotas.filter((cuota) => cuota.estado !== 'PAGADA');
  const saldo = plantilla.estado === 'CANCELADA'
    ? 0
    : redondear(pendientes.reduce((total, cuota) => total + restar(cuota.capital, cuota.capitalPagado), 0));
  const solca = contribucionSolca(plantilla.monto);
  return {
    cuotas,
    detalle: {
      idPrestamo: indice + 1,
      numeroPrestamo: plantilla.numero,
      idSolicitud: 100 + indice,
      identificacionCliente: plantilla.identificacion,
      nombreCompletoCliente: plantilla.nombre,
      cuentaDestino: plantilla.cuenta,
      sistemaAmortizacion: plantilla.sistema,
      montoAprobado: plantilla.monto,
      plazoMes: plantilla.plazo,
      teaAsignada: redondear(plantilla.tea * 10000) / 100,
      tasaNominalAnual: redondear(tasaNominalDesdeTea(plantilla.tea) * 10000) / 100,
      tasaMensual: redondear(tasaMensualDesdeTea(plantilla.tea) * 10000) / 100,
      seguroMensual: seguroMensual(plantilla.monto),
      contribucionSolca: solca,
      montoNeto: restar(plantilla.monto, solca),
      fechaDesembolso: desembolso,
      referenciaDesembolso: `DES-${plantilla.numero}`,
      estadoInstruccion: 'APLICADA',
      estado: plantilla.estado,
      diaMora: plantilla.diaMora,
      saldoCapital: saldo,
      interesDevengadoAcumulado: redondear(saldo * 0.012),
      provision: redondear(saldo * provisionPorEstado(plantilla.estado, plantilla.diaMora)),
      fechaCancelacion: plantilla.estado === 'CANCELADA' ? sumarMeses(FECHA_NEGOCIO_INICIAL, -1) : null,
      fechaCastigo: plantilla.estado === 'CASTIGADA' ? sumarDias(FECHA_NEGOCIO_INICIAL, -3) : null,
    },
  };
}

function provisionPorEstado(estado: EstadoPrestamo, diaMora: number): number {
  if (estado === 'CASTIGADA') {
    return 1;
  }
  if (diaMora === 0) {
    return 0.01;
  }
  if (diaMora <= 30) {
    return 0.05;
  }
  if (diaMora <= 90) {
    return 0.25;
  }
  return 0.6;
}

export const OPERACIONES = PLANTILLAS.map(construirOperacion);

export const SOLICITUDES_BANDEJA: SolicitudBandeja[] = [
  { idSolicitud: 201, identificacionCliente: '0213732191', nombreCompletoCliente: 'Mariela Jácome Andrade', montoSolicitado: 10000, plazoMes: 12, sistemaAmortizacion: 'FRANCES', destino: 'BIENES_DURADEROS', ingresoMensual: 3500, gastoMensual: 1200, remanenteMensual: 2300, cuotaMaximaAdmisible: 920, cuotaProyectada: 911.44, porcentajeCuotaSobreRemanente: 39.63, fechaHoraRegistro: '2026-10-29T09:14:00' },
  { idSolicitud: 202, identificacionCliente: '1104556677', nombreCompletoCliente: 'Esteban Carrión Vega', montoSolicitado: 6000, plazoMes: 24, sistemaAmortizacion: 'FRANCES', destino: 'EDUCACION', ingresoMensual: 2100, gastoMensual: 900, remanenteMensual: 1200, cuotaMaximaAdmisible: 480, cuotaProyectada: 297.81, porcentajeCuotaSobreRemanente: 24.82, fechaHoraRegistro: '2026-10-29T15:42:00' },
  { idSolicitud: 203, identificacionCliente: '0912334455', nombreCompletoCliente: 'Lucía Montalvo Ponce', montoSolicitado: 20000, plazoMes: 48, sistemaAmortizacion: 'ALEMAN', destino: 'SALUD', ingresoMensual: 4800, gastoMensual: 2600, remanenteMensual: 2200, cuotaMaximaAdmisible: 880, cuotaProyectada: 686.71, porcentajeCuotaSobreRemanente: 31.21, fechaHoraRegistro: '2026-10-30T08:05:00' },
  { idSolicitud: 204, identificacionCliente: '0604112233', nombreCompletoCliente: 'Gabriela Suárez Mena', montoSolicitado: 4500, plazoMes: 12, sistemaAmortizacion: 'FRANCES', destino: 'VIAJE', ingresoMensual: 1800, gastoMensual: 1150, remanenteMensual: 650, cuotaMaximaAdmisible: 260, cuotaProyectada: 412.15, porcentajeCuotaSobreRemanente: 63.41, fechaHoraRegistro: '2026-10-30T11:27:00' },
];

export const SOLICITUDES_CLIENTE: SolicitudCliente[] = [
  { idSolicitud: 201, montoSolicitado: 10000, plazoMes: 12, sistemaAmortizacion: 'FRANCES', destino: 'BIENES_DURADEROS', estado: 'REGISTRADA', teaAsignada: null, motivoRechazo: null, fechaHoraRegistro: '2026-10-29T09:14:00', fechaHoraResolucion: null },
  { idSolicitud: 180, montoSolicitado: 8000, plazoMes: 24, sistemaAmortizacion: 'FRANCES', destino: 'OTRO', estado: 'DESEMBOLSADA', teaAsignada: 16.2, motivoRechazo: null, fechaHoraRegistro: '2026-04-12T10:00:00', fechaHoraResolucion: '2026-04-13T16:20:00' },
  { idSolicitud: 164, montoSolicitado: 26000, plazoMes: 60, sistemaAmortizacion: 'ALEMAN', destino: 'SALUD', estado: 'RECHAZADA', teaAsignada: null, motivoRechazo: 'La cuota proyectada supera el 40 % del remanente mensual', fechaHoraRegistro: '2026-02-03T08:45:00', fechaHoraResolucion: '2026-02-03T08:45:00' },
];
