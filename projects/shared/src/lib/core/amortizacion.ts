import { redondear, restar, sumar } from './dinero';
import { sumarMeses } from './fechas';
import { CuotaCalculada, Simulacion, SistemaAmortizacion } from './modelos';

export const FACTOR_SEGURO = 0.0006;
export const FACTOR_SOLCA = 0.005;
export const BASE_ANUAL = 360;

export function tasaMensualDesdeTea(tea: number): number {
  return Math.pow(1 + tea, 1 / 12) - 1;
}

export function tasaNominalDesdeTea(tea: number): number {
  return 12 * tasaMensualDesdeTea(tea);
}

export function seguroMensual(monto: number): number {
  return redondear(monto * FACTOR_SEGURO);
}

export function contribucionSolca(monto: number): number {
  return redondear(monto * FACTOR_SOLCA);
}

export function interesDiario(saldo: number, tasaNominal: number, dias: number): number {
  return redondear((saldo * tasaNominal * dias) / BASE_ANUAL);
}

export function generarTabla(
  monto: number,
  plazoMeses: number,
  tea: number,
  sistema: SistemaAmortizacion,
  fechaDesembolso: string,
): CuotaCalculada[] {
  const tasa = tasaMensualDesdeTea(tea);
  const seguro = seguroMensual(monto);
  const cuotas: CuotaCalculada[] = [];
  let saldo = monto;

  const cuotaFija =
    sistema === 'FRANCES' ? redondear((monto * tasa) / (1 - Math.pow(1 + tasa, -plazoMeses))) : 0;
  const capitalFijo = sistema === 'ALEMAN' ? redondear(monto / plazoMeses) : 0;

  for (let numero = 1; numero <= plazoMeses; numero++) {
    const interes = redondear(saldo * tasa);
    let capital = sistema === 'FRANCES' ? restar(cuotaFija, interes) : capitalFijo;
    if (numero === plazoMeses) {
      capital = saldo;
    }
    const saldoPosterior = restar(saldo, capital);
    cuotas.push({
      numero,
      fechaVencimiento: sumarMeses(fechaDesembolso, numero),
      capital,
      interes,
      seguro,
      cuotaTotal: sumar(capital, interes, seguro),
      saldoCapitalPosterior: saldoPosterior,
    });
    saldo = saldoPosterior;
  }
  return cuotas;
}

export function simular(
  monto: number,
  plazoMeses: number,
  tea: number,
  sistema: SistemaAmortizacion,
  fechaDesembolso: string,
): Simulacion {
  const tabla = generarTabla(monto, plazoMeses, tea, sistema, fechaDesembolso);
  const totalIntereses = redondear(tabla.reduce((total, cuota) => total + cuota.interes, 0));
  const totalSeguros = redondear(tabla.reduce((total, cuota) => total + cuota.seguro, 0));
  const solca = contribucionSolca(monto);
  return {
    sistemaAmortizacion: sistema,
    monto,
    plazoMeses,
    teaReferencial: redondear(tea * 10000) / 100,
    tasaNominalAnual: redondear(tasaNominalDesdeTea(tea) * 10000) / 100,
    tasaMensual: redondear(tasaMensualDesdeTea(tea) * 10000) / 100,
    cuotaPrimera: tabla[0].cuotaTotal,
    cuotaUltima: tabla[tabla.length - 1].cuotaTotal,
    seguroMensual: seguroMensual(monto),
    contribucionSolca: solca,
    montoNeto: restar(monto, solca),
    totalIntereses,
    totalSeguros,
    costoTotal: sumar(totalIntereses, totalSeguros, solca),
    tabla,
  };
}
