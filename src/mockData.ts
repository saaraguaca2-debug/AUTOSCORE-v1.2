import { Mecanico, Vehiculo, HistorialRow } from "./types";

// Datos iniciales de mecánicos (uno Activo y otro Suspendido para probar reglas de negocio)
const MOCK_MECANICOS: Mecanico[] = [
  {
    codigoMecanico: "M101",
    nombre: "Carlos Mendoza",
    taller: "Mendoza Motors (Altamira)",
    estado: "Activo"
  },
  {
    codigoMecanico: "M202",
    nombre: "José Rodríguez",
    taller: "Rodríguez Performance (Boleíta)",
    estado: "Suspendido" // Para probar bloqueo de membresía por falta de pago
  },
  {
    codigoMecanico: "M303",
    nombre: "Valentina Gómez",
    taller: "Caracas Tuning Lab (Chacao)",
    estado: "Activo"
  }
];

// Datos iniciales de vehículos
const MOCK_VEHICULOS: Vehiculo[] = [
  {
    placa: "AB123CD",
    marca: "Toyota",
    modelo: "Corolla",
    anio: 2018,
    idDueno: "26123456",
    score: 94,
    estadoCertificado: "Activo"
  },
  {
    placa: "EF456GH",
    marca: "Jeep",
    modelo: "Grand Cherokee Laredo",
    anio: 2015,
    idDueno: "26123456",
    score: 78,
    estadoCertificado: "Activo"
  },
  {
    placa: "JK789LM",
    marca: "Chevrolet",
    modelo: "Aveo LT",
    anio: 2011,
    idDueno: "26123456",
    score: 45,
    estadoCertificado: "Vencido"
  },
  {
    placa: "XY987ZT",
    marca: "Ford",
    modelo: "Fiesta Titanium",
    anio: 2013,
    idDueno: "12987654",
    score: 82,
    estadoCertificado: "Activo"
  }
];

// Datos iniciales del historial de mantenimientos verificado
const MOCK_HISTORIAL: HistorialRow[] = [
  {
    idHistorial: 10001,
    placa: "AB123CD",
    fecha: "2026-05-10 14:30:22",
    kilometraje: 45000,
    codigoMecanico: "M101",
    taller: "Mendoza Motors (Altamira)",
    trabajoRealizado: "Cambio de correa de tiempo, bujías denso de iridio, limpieza profunda de inyectores por ultrasonido y reemplazo de filtro de gasolina."
  },
  {
    idHistorial: 10002,
    placa: "AB123CD",
    fecha: "2026-01-15 09:15:00",
    kilometraje: 42000,
    codigoMecanico: "M303",
    taller: "Caracas Tuning Lab (Chacao)",
    trabajoRealizado: "Servicio de lubricación completo. Cambio de aceite semisintético 15W40, filtro de aire de motor, filtro de cabina y revisión general de frenos delanteros."
  },
  {
    idHistorial: 10003,
    placa: "EF456GH",
    fecha: "2026-04-02 11:20:10",
    kilometraje: 112000,
    codigoMecanico: "M101",
    taller: "Mendoza Motors (Altamira)",
    trabajoRealizado: "Sustitución de amortiguadores delanteros marca Gabriel, reparación menor del sistema de dirección (terminales) con alineación computarizada y balanceo."
  },
  {
    idHistorial: 10004,
    placa: "JK789LM",
    fecha: "2025-11-20 16:45:00",
    kilometraje: 185000,
    codigoMecanico: "M202",
    taller: "Rodríguez Performance (Boleíta)",
    trabajoRealizado: "Reparación de fuga de refrigerante en manguera superior del radiador, reemplazo de tapa de envase de expansión y purga de sistema con refrigerante premium."
  }
];

// Función para inicializar el LocalStorage si no tiene datos cargados
export function inicializarBaseDatosSimulada() {
  if (!localStorage.getItem("autoscore_inicializado")) {
    localStorage.setItem("autoscore_mecanicos", JSON.stringify(MOCK_MECANICOS));
    localStorage.setItem("autoscore_vehiculos", JSON.stringify(MOCK_VEHICULOS));
    localStorage.setItem("autoscore_historial", JSON.stringify(MOCK_HISTORIAL));
    localStorage.setItem("autoscore_inicializado", "true");
    console.log("AutoScore: Base de datos local simulada inicializada correctamente.");
  }
}

// Obtener datos actuales del localStorage
export function getSimulatedData() {
  inicializarBaseDatosSimulada();
  return {
    mecanicos: JSON.parse(localStorage.getItem("autoscore_mecanicos") || "[]") as Mecanico[],
    vehiculos: JSON.parse(localStorage.getItem("autoscore_vehiculos") || "[]") as Vehiculo[],
    historial: JSON.parse(localStorage.getItem("autoscore_historial") || "[]") as HistorialRow[]
  };
}

// Guardar datos actualizados
export function saveSimulatedData(data: { mecanicos: Mecanico[]; vehiculos: Vehiculo[]; historial: HistorialRow[] }) {
  localStorage.setItem("autoscore_mecanicos", JSON.stringify(data.mecanicos));
  localStorage.setItem("autoscore_vehiculos", JSON.stringify(data.vehiculos));
  localStorage.setItem("autoscore_historial", JSON.stringify(data.historial));
}

/**
 * SIMULACIÓN DE ENDPOINTS DEL BACKEND GOOGLE APPS SCRIPT
 */

// Buscar por idDueno
export function simularGetPorDueno(idDueno: string) {
  const data = getSimulatedData();
  const searchId = idDueno.trim().toLowerCase();
  
  const filtrados = data.vehiculos.filter(
    v => v.idDueno.trim().toLowerCase() === searchId
  );
  
  return {
    success: true,
    count: filtrados.length,
    data: filtrados
  };
}

// Buscar por placa y tipo de certificado
export function simularGetCertificado(placa: string, tipoCertificado: string) {
  const data = getSimulatedData();
  const searchPlaca = placa.trim().toUpperCase();
  const tipo = tipoCertificado.trim().toLowerCase();
  
  const vehiculo = data.vehiculos.find(v => v.placa.trim().toUpperCase() === searchPlaca);
  if (!vehiculo) {
    return { success: false, error: "Vehículo no registrado en AutoScore" };
  }
  
  const respuesta: any = {
    success: true,
    tipoCertificado: tipo,
    vehiculo: { ...vehiculo }
  };
  
  if (tipo === "completo") {
    // Buscar historial de mantenimientos para esta placa
    const mantenimientos = data.historial
      .filter(h => h.placa.trim().toUpperCase() === searchPlaca)
      .map(h => {
        const mec = data.mecanicos.find(m => m.codigoMecanico === h.codigoMecanico);
        let phone = "";
        if (h.codigoMecanico === "M101") phone = "584121111111";
        else if (h.codigoMecanico === "M202") phone = "584122222222";
        else if (h.codigoMecanico === "M303") phone = "584123333333";
        else phone = "584120000000";
        return {
          ...h,
          nombreMecanico: mec ? mec.nombre : "Técnico Especialista AutoScore",
          telefono: phone
        };
      })
      .sort((a, b) => b.kilometraje - a.kilometraje);
    
    respuesta.historial = mantenimientos;
  }
  
  return respuesta;
}

// Registrar nuevo mantenimiento (POST)
export function simularPostMantenimiento(payload: {
  codigoMecanico: string;
  placa: string;
  kilometraje: number;
  trabajo: string;
}) {
  const data = getSimulatedData();
  const codMec = payload.codigoMecanico.trim();
  const placa = payload.placa.trim().toUpperCase();
  const km = Number(payload.kilometraje || 0);
  const trabajo = payload.trabajo.trim();
  
  if (!codMec || !placa || !km || !trabajo) {
    return { success: false, error: "Faltan datos requeridos para el registro" };
  }
  
  // 1. Validar mecánico
  const mecanico = data.mecanicos.find(m => m.codigoMecanico === codMec);
  if (!mecanico) {
    return { success: false, error: "Código de mecánico no registrado o inválido en AutoScore" };
  }
  
  // Bloquear por membresía suspendida
  if (mecanico.estado === "Suspendido") {
    return {
      success: false,
      error: `ACCESO DENEGADO: Su cuenta de mecánico (${mecanico.nombre}) está SUSPENDIDA por falta de pago de membresía de AutoScore. Regularice su estado para poder firmar.`
    };
  }
  
  // 2. Validar que el carro existe en la DB
  const vehiculoIndex = data.vehiculos.findIndex(v => v.placa.toUpperCase() === placa);
  if (vehiculoIndex === -1) {
    return {
      success: false,
      error: `La placa '${placa}' no se encuentra registrada en el sistema de vehículos homologados de AutoScore.`
    };
  }
  
  // 3. Crear registro de mantenimiento
  const newId = data.historial.length > 0 
    ? Math.max(...data.historial.map(h => h.idHistorial)) + 1 
    : 10001;
    
  const now = new Date();
  const fechaString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  const nuevoHistorial: HistorialRow = {
    idHistorial: newId,
    placa: placa,
    fecha: fechaString,
    kilometraje: km,
    codigoMecanico: codMec,
    taller: mecanico.taller || "Taller Independiente",
    trabajoRealizado: trabajo
  };
  
  // Guardar en base de datos local
  data.historial.push(nuevoHistorial);
  
  // Actualizar el kilometraje y opcionalmente recalcular el score del carro
  // Vamos a recalcular el score ligeramente de manera dinámica en el simulador por diversión,
  // subiendo o ajustando el score si tiene mantenimientos recientes cargados.
  const totalMantenimientos = data.historial.filter(h => h.placa === placa).length;
  // Un score simulado saludable basado en la cantidad de registros verídicos
  const scoreBase = data.vehiculos[vehiculoIndex].score;
  const nuevoScore = Math.min(100, Math.max(40, scoreBase + 2)); // cada servicio verificado sube 2 puntos!
  data.vehiculos[vehiculoIndex].score = nuevoScore;
  
  saveSimulatedData(data);
  
  return {
    success: true,
    message: "¡Mantenimiento verificado registrado exitosamente en la base de datos!",
    data: {
      idHistorial: newId,
      placa: placa,
      fecha: fechaString,
      mecanico: mecanico.nombre,
      taller: mecanico.taller
    }
  };
}

// Función auxiliar para registrar un carro nuevo directamente en el Simulador (para robustez extra)
export function simularRegistrarVehiculo(vehiculo: Vehiculo) {
  const data = getSimulatedData();
  const placaUpper = vehiculo.placa.trim().toUpperCase();
  
  if (data.vehiculos.some(v => v.placa === placaUpper)) {
    return { success: false, error: "El vehículo con esta placa ya existe." };
  }
  
  const nuevo: Vehiculo = {
    ...vehiculo,
    placa: placaUpper,
    score: Number(vehiculo.score || 80),
    estadoCertificado: vehiculo.estadoCertificado || "Activo"
  };
  
  data.vehiculos.push(nuevo);
  saveSimulatedData(data);
  return { success: true, vehiculo: nuevo };
}
