import { Injectable, signal } from '@angular/core';
import { Perfil } from './modelos';

export interface Sesion {
  perfil: Perfil;
  identificacion: string;
  nombre: string;
  idAnalista: number;
}

const CLAVE = 'banquito-sesion';

@Injectable({ providedIn: 'root' })
export class SesionService {
  readonly sesion = signal<Sesion | null>(this.recuperar());

  ingresar(sesion: Sesion): void {
    this.sesion.set(sesion);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(sesion));
    } catch {
      return;
    }
  }

  salir(): void {
    this.sesion.set(null);
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      return;
    }
  }

  private recuperar(): Sesion | null {
    try {
      const guardado = localStorage.getItem(CLAVE);
      return guardado ? (JSON.parse(guardado) as Sesion) : null;
    } catch {
      return null;
    }
  }
}
