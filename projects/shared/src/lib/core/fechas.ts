export function sumarMeses(fechaIso: string, meses: number): string {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  const corrido = mes - 1 + meses;
  const anioFinal = anio + Math.floor(corrido / 12);
  const mesFinal = ((corrido % 12) + 12) % 12;
  const ultimoDia = new Date(Date.UTC(anioFinal, mesFinal + 1, 0)).getUTCDate();
  return componer(anioFinal, mesFinal + 1, Math.min(dia, ultimoDia));
}

export function sumarDias(fechaIso: string, dias: number): string {
  const base = Date.parse(`${fechaIso}T00:00:00Z`) + dias * 86400000;
  const fecha = new Date(base);
  return componer(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, fecha.getUTCDate());
}

export function diasEntre(desde: string, hasta: string): number {
  return Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86400000);
}

export function formatearFecha(fechaIso: string): string {
  if (!fechaIso) {
    return '';
  }
  const [anio, mes, dia] = fechaIso.split('-');
  return `${dia}/${mes}/${anio}`;
}

export function formatearFechaLarga(fechaIso: string): string {
  if (!fechaIso) {
    return '';
  }
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  return `${dia} de ${meses[mes - 1]} de ${anio}`;
}

function componer(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}
