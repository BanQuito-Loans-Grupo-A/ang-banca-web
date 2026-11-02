export type NombreIcono =
  | 'inicio'
  | 'calculadora'
  | 'documento'
  | 'cartera'
  | 'grafico'
  | 'engranaje'
  | 'luna'
  | 'sol'
  | 'usuario'
  | 'buscar'
  | 'flecha-derecha'
  | 'flecha-izquierda'
  | 'verificado'
  | 'alerta'
  | 'reloj'
  | 'calendario'
  | 'dinero'
  | 'escudo'
  | 'menu'
  | 'cerrar'
  | 'mas'
  | 'salir'
  | 'rayo'
  | 'capas'
  | 'dolar'
  | 'billetera'
  | 'monedas'
  | 'escudo-check'
  | 'chevron-derecha'
  | 'candado'
  | 'identificacion'
  | 'usuario-mas';

export const ICONOS: Record<NombreIcono, string> = {
  inicio: 'M3 11l9-8 9 8M5 9.5V21h14V9.5M10 21v-6h4v6',
  calculadora: 'M5 3h14v18H5zM8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0M8 18h6',
  documento: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h7M10 17h7',
  cartera: 'M3 8h18v12H3zM8 8V5h8v3M3 13h18',
  grafico: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  engranaje:
    'M12 9a3 3 0 100 6 3 3 0 000-6zM12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2',
  luna: 'M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z',
  sol: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
  usuario: 'M12 11a4 4 0 100-8 4 4 0 000 8zM4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1',
  buscar: 'M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4',
  'flecha-derecha': 'M4 12h15M13 6l6 6-6 6',
  'flecha-izquierda': 'M20 12H5M11 18l-6-6 6-6',
  verificado: 'M20 7L10 17l-5-5',
  alerta: 'M12 3L2 20h20L12 3zM12 10v5M12 18h0',
  reloj: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  calendario: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  dinero: 'M12 2v20M17 6H9.5a3 3 0 000 6h5a3 3 0 010 6H6',
  escudo: 'M12 2l8 3v7c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  cerrar: 'M6 6l12 12M18 6L6 18',
  mas: 'M12 5v14M5 12h14',
  salir: 'M15 4h4v16h-4M11 8l-4 4 4 4M7 12h11',
  rayo: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  capas: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  dolar:
    'M12 21a9 9 0 100-18 9 9 0 000 18zM14.8 9.3c-.5-.8-1.5-1.3-2.8-1.3-1.6 0-2.8.8-2.8 2s1.2 1.7 2.8 2 2.8.8 2.8 2-1.2 2-2.8 2c-1.3 0-2.3-.5-2.8-1.3M12 6.5V8M12 16v1.5',
  billetera: 'M4 8h15a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V8zM4 8l12-4v4M16 14h4',
  monedas:
    'M8 7c0 1.1 2 2 4.5 2S17 8.1 17 7s-2-2-4.5-2S8 5.9 8 7zM8 7v4c0 1.1 2 2 4.5 2s4.5-.9 4.5-2V7M4 15c0 1.1 2 2 4.5 2s4.5-.9 4.5-2-2-2-4.5-2S4 13.9 4 15zM4 15v3c0 1.1 2 2 4.5 2s4.5-.9 4.5-2v-3',
  'escudo-check': 'M12 2l8 3v7c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3zM9 12l2 2 4-4',
  'chevron-derecha': 'M9 6l6 6-6 6',
  candado: 'M6 11h12v10H6zM8 11V7a4 4 0 018 0v4M12 15v2',
  identificacion:
    'M3 5h18v14H3zM7 10a2 2 0 104 0 2 2 0 00-4 0zM6 16c.5-1.5 1.7-2.2 3-2.2s2.5.7 3 2.2M14 9h4M14 13h4',
  'usuario-mas':
    'M10 11a4 4 0 100-8 4 4 0 000 8zM3 21v-1a6 6 0 016-6h2a6 6 0 016 6v1M19 7v6M16 10h6',
};
