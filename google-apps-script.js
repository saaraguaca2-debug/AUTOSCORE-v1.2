/**
 * AUTOSCORE - ENGINE EN GOOGLE APPS SCRIPT
 * Código para el Editor de Apps Script asociado a tu Google Sheets.
 * 
 * Configura tu Google Sheet con 3 pestañas:
 * 1. "Mecanicos" -> Columnas: CodigoMecanico, Nombre, Taller, Estado
 * 2. "Vehiculos" -> Columnas: Placa, Marca, Modelo, Anio, IdDueno, Score, EstadoCertificado
 * 3. "Historial" -> Columnas: IdHistorial, Placa, Fecha, Kilometraje, CodigoMecanico, Taller, TrabajoRealizado
 */

// Cabeceras CORS obligatorias para peticiones desde el navegador
function getCorsResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Manejar solicitudes OPTIONS (Preflight CORS)
function doOptions(e) {
  return getCorsResponse({ status: "CORS OK" });
}

/**
 * MÉTODO GET: Consulta de información
 * Soporta buscar por '?idDueno=...' o por '?placa=...&tipoCertificado=...'
 */
function doGet(e) {
  try {
    const sheetApp = SpreadsheetApp.getActiveSpreadsheet();
    const params = e.parameter;
    
    // CASO 1: Consulta por ID de Dueño (Cédula o Correo)
    if (params.idDueno) {
      const idDueno = params.idDueno.toString().trim().toLowerCase();
      const sheetVehiculos = sheetApp.getSheetByName("Vehiculos");
      
      if (!sheetVehiculos) {
        return getCorsResponse({ success: false, error: "Pestaña 'Vehiculos' no encontrada" });
      }
      
      const data = sheetVehiculos.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      const colPlaca = headers.indexOf("Placa");
      const colMarca = headers.indexOf("Marca");
      const colModelo = headers.indexOf("Modelo");
      const colAnio = headers.indexOf("Anio");
      const colIdDueno = headers.indexOf("IdDueno");
      const colScore = headers.indexOf("Score");
      const colEstado = headers.indexOf("EstadoCertificado");
      
      const misVehiculos = [];
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row[colIdDueno] && row[colIdDueno].toString().trim().toLowerCase() === idDueno) {
          misVehiculos.push({
            placa: row[colPlaca],
            marca: row[colMarca],
            modelo: row[colModelo],
            anio: row[colAnio],
            score: Number(row[colScore] || 0),
            estadoCertificado: row[colEstado] || "Activo"
          });
        }
      }
      
      return getCorsResponse({ success: true, count: misVehiculos.length, data: misVehiculos });
    }
    
    // CASO 2: Consulta de Certificado por Placa (Simple o Completo)
    if (params.placa) {
      const placa = params.placa.toString().trim().toUpperCase();
      const tipoCertificado = (params.tipoCertificado || "simple").toString().toLowerCase();
      
      const sheetVehiculos = sheetApp.getSheetByName("Vehiculos");
      if (!sheetVehiculos) {
        return getCorsResponse({ success: false, error: "Pestaña 'Vehiculos' no encontrada" });
      }
      
      const vehiculosData = sheetVehiculos.getDataRange().getValues();
      const headersV = vehiculosData[0];
      const rowsV = vehiculosData.slice(1);
      
      const colPlaca = headersV.indexOf("Placa");
      const colMarca = headersV.indexOf("Marca");
      const colModelo = headersV.indexOf("Modelo");
      const colAnio = headersV.indexOf("Anio");
      const colScore = headersV.indexOf("Score");
      const colEstado = headersV.indexOf("EstadoCertificado");
      const colIdDueno = headersV.indexOf("IdDueno");
      
      let vehiculo = null;
      for (let i = 0; i < rowsV.length; i++) {
        if (rowsV[i][colPlaca].toString().trim().toUpperCase() === placa) {
          vehiculo = {
            placa: rowsV[i][colPlaca],
            marca: rowsV[i][colMarca],
            modelo: rowsV[i][colModelo],
            anio: rowsV[i][colAnio],
            score: Number(rowsV[i][colScore] || 0),
            estadoCertificado: rowsV[i][colEstado] || "Activo",
            idDueno: rowsV[i][colIdDueno]
          };
          break;
        }
      }
      
      if (!vehiculo) {
        return getCorsResponse({ success: false, error: "Vehículo no registrado en AutoScore" });
      }
      
      // Estructurar respuesta base (Certificado Simple)
      const respuesta = {
        success: true,
        tipoCertificado: tipoCertificado,
        vehiculo: vehiculo
      };
      
      // Si el certificado es Completo, desglosamos el historial detallado de mantenimientos
      if (tipoCertificado === "completo") {
        const sheetHistorial = sheetApp.getSheetByName("Historial");
        if (sheetHistorial) {
          const historialData = sheetHistorial.getDataRange().getValues();
          const headersH = historialData[0];
          const rowsH = historialData.slice(1);
          
          const hPlaca = headersH.indexOf("Placa");
          const hId = headersH.indexOf("IdHistorial");
          const hFecha = headersH.indexOf("Fecha");
          const hKm = headersH.indexOf("Kilometraje");
          const hCodMec = headersH.indexOf("CodigoMecanico");
          const hTaller = headersH.indexOf("Taller");
          const hTrabajo = headersH.indexOf("TrabajoRealizado");
          
          const timeline = [];
          for (let j = 0; j < rowsH.length; j++) {
            if (rowsH[j][hPlaca].toString().trim().toUpperCase() === placa) {
              timeline.push({
                idHistorial: rowsH[j][hId],
                fecha: rowsH[j][hFecha],
                kilometraje: Number(rowsH[j][hKm] || 0),
                codigoMecanico: rowsH[j][hCodMec],
                taller: rowsH[j][hTaller] || "Taller Independiente",
                trabajoRealizado: rowsH[j][hTrabajo]
              });
            }
          }
          
          // Ordenar el historial por kilometraje o fecha (más reciente primero)
          timeline.sort((a, b) => b.kilometraje - a.kilometraje);
          respuesta.historial = timeline;
        } else {
          respuesta.historial = [];
        }
      }
      
      return getCorsResponse(respuesta);
    }
    
    return getCorsResponse({ success: false, error: "Parámetros insuficientes. Use '?idDueno' o '?placa'" });
    
  } catch (error) {
    return getCorsResponse({ success: false, error: error.toString() });
  }
}

/**
 * MÉTODO POST: Registro de nuevos trabajos por el mecánico
 * Valida estado del mecánico ('Activo' o 'Suspendido') antes de registrar
 */
function doPost(e) {
  try {
    const sheetApp = SpreadsheetApp.getActiveSpreadsheet();
    let payload = null;
    
    // Intentar leer los datos del cuerpo JSON, o en su defecto de los parámetros de formulario
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }
    
    const codigoMecanico = (payload.codigoMecanico || payload.codMec || "").toString().trim();
    const placa = (payload.placa || "").toString().trim().toUpperCase();
    const kilometraje = Number(payload.kilometraje || 0);
    const trabajo = (payload.trabajo || payload.trabajoRealizado || "").toString().trim();
    
    if (!codigoMecanico || !placa || !kilometraje || !trabajo) {
      return getCorsResponse({ 
        success: false, 
        error: "Faltan datos requeridos (codigoMecanico, placa, kilometraje, trabajo)" 
      });
    }
    
    // 1. VALIDACIÓN DEL MECÁNICO (Control de membresía activa)
    const sheetMecanicos = sheetApp.getSheetByName("Mecanicos");
    if (!sheetMecanicos) {
      return getCorsResponse({ success: false, error: "Pestaña 'Mecanicos' no encontrada en la base de datos" });
    }
    
    const mecData = sheetMecanicos.getDataRange().getValues();
    const headersM = mecData[0];
    const rowsM = mecData.slice(1);
    
    const colCod = headersM.indexOf("CodigoMecanico");
    const colNombre = headersM.indexOf("Nombre");
    const colTaller = headersM.indexOf("Taller");
    const colEstado = headersM.indexOf("Estado");
    
    let mecanico = null;
    for (let i = 0; i < rowsM.length; i++) {
      if (rowsM[i][colCod].toString().trim() === codigoMecanico) {
        mecanico = {
          codigo: rowsM[i][colCod],
          nombre: rowsM[i][colNombre],
          taller: rowsM[i][colTaller],
          estado: (rowsM[i][colEstado] || "Activo").toString().trim()
        };
        break;
      }
    }
    
    if (!mecanico) {
      return getCorsResponse({ success: false, error: "Código de mecánico no registrado o inválido" });
    }
    
    // Bloquear si el mecánico está suspendido por falta de pago de membresía
    if (mecanico.estado.toLowerCase() === "suspendido") {
      return getCorsResponse({ 
        success: false, 
        error: "ACCESO DENEGADO: Su cuenta de mecánico está SUSPENDIDA por falta de pago. Por favor, regularice su membresía de AutoScore." 
      });
    }
    
    // 2. VALIDAR QUE EL VEHÍCULO EXISTE (Para evitar registrar mantenimientos de placas fantasma)
    const sheetVehiculos = sheetApp.getSheetByName("Vehiculos");
    let vehiculoExiste = false;
    if (sheetVehiculos) {
      const vehData = sheetVehiculos.getDataRange().getValues();
      const colPlacaV = vehData[0].indexOf("Placa");
      for (let k = 1; k < vehData.length; k++) {
        if (vehData[k][colPlacaV].toString().trim().toUpperCase() === placa) {
          vehiculoExiste = true;
          break;
        }
      }
    }
    
    // Si no existe, podemos opcionalmente crearlo con datos genéricos, o retornar error.
    // Para ser amigables y robustos en producción, si no existe devolvemos un mensaje o lo aceptamos.
    // Vamos a requerir que exista para mantener integridad del sistema estilo Carfax
    if (!vehiculoExiste) {
      return getCorsResponse({ 
        success: false, 
        error: "La placa '" + placa + "' no está registrada en el sistema AutoScore. Registre primero el carro." 
      });
    }
    
    // 3. INSERCIÓN DE LA NUEVA FILA EN EL HISTORIAL
    const sheetHistorial = sheetApp.getSheetByName("Historial");
    if (!sheetHistorial) {
      return getCorsResponse({ success: false, error: "Pestaña 'Historial' no encontrada en la base de datos" });
    }
    
    // Calcular ID Autoincremental
    const lastRow = sheetHistorial.getLastRow();
    let newId = 10001; // ID inicial
    if (lastRow > 1) {
      const lastIdVal = sheetHistorial.getRange(lastRow, 1).getValue();
      if (!isNaN(lastIdVal)) {
        newId = Number(lastIdVal) + 1;
      }
    }
    
    const fechaActual = Utilities.formatDate(new Date(), "GMT-4", "yyyy-MM-dd HH:mm:ss");
    
    // Orden de columnas: IdHistorial, Placa, Fecha, Kilometraje, CodigoMecanico, Taller, TrabajoRealizado
    sheetHistorial.appendRow([
      newId,
      placa,
      fechaActual,
      kilometraje,
      codigoMecanico,
      mecanico.taller || "Taller Independiente",
      trabajo
    ]);
    
    // Opcional: Actualizar el kilometraje o recalcular dinámicamente un Score basado en el mantenimiento
    // Para mantener el sistema ágil, devolvemos éxito directo.
    return getCorsResponse({
      success: true,
      message: "Mantenimiento verificado registrado exitosamente en AutoScore",
      data: {
        idHistorial: newId,
        placa: placa,
        fecha: fechaActual,
        mecanico: mecanico.nombre,
        taller: mecanico.taller
      }
    });
    
  } catch (error) {
    return getCorsResponse({ success: false, error: error.toString() });
  }
}
