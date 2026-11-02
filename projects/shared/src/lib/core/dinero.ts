export function redondear(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function sumar(...valores: number[]): number {
  return redondear(valores.reduce((total, valor) => total + valor, 0));
}

export function restar(minuendo: number, sustraendo: number): number {
  return redondear(minuendo - sustraendo);
}

export function multiplicar(factor: number, multiplicador: number): number {
  return redondear(factor * multiplicador);
}

export function porcentaje(valor: number, tasa: number): number {
  return redondear(valor * tasa);
}
