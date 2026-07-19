export interface Mecanico {
  codigoMecanico: string;
  nombre: string;
  taller: string;
  estado: "Activo" | "Suspendido";
}

export interface Vehiculo {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  idDueno: string; // Cédula o Correo del dueño
  score: number; // 0-100 calificación mecánica
  estadoCertificado: "Activo" | "Vencido";
}

export interface HistorialRow {
  idHistorial: number;
  placa: string;
  fecha: string;
  kilometraje: number;
  codigoMecanico: string;
  taller: string;
  trabajoRealizado: string;
}

export type VistaActual = "home" | "usuario" | "mecanico" | "documentacion";
