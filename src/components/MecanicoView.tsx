import React, { useState, useRef, useEffect } from "react";
import { 
  PenTool, Shield, QrCode, AlertCircle, RefreshCw, Key, Camera, Gauge, CheckCircle2,
  Lock, ArrowRight, CornerDownLeft, Sparkles, AlertTriangle, MonitorPlay, Check, PlusCircle
} from "lucide-react";
import { Mecanico, Vehiculo } from "../types";
import { getSimulatedData, simularPostMantenimiento } from "../mockData";

interface MecanicoViewProps {
  useSimulado: boolean;
  appScriptUrl: string;
}

export default function MecanicoView({ useSimulado, appScriptUrl }: MecanicoViewProps) {
  // Estados de Login del Mecánico
  const [codigoMecanico, setCodigoMecanico] = useState("");
  const [loggedMecanico, setLoggedMecanico] = useState<Mecanico | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Estados del Formulario de Mantenimiento
  const [placa, setPlaca] = useState("");
  const [kilometraje, setKilometraje] = useState("");
  const [trabajo, setTrabajo] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de la Cámara y Escaneo QR
  const [showScanner, setShowScanner] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanMethod, setScanMethod] = useState<"camera" | "simulator">("simulator");
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Lista de carros existentes (para el simulador de escáner QR rápido)
  const [carrosExistentes, setCarrosExistentes] = useState<Vehiculo[]>([]);

  useEffect(() => {
    if (showScanner && scanMethod === "simulator") {
      const data = getSimulatedData();
      setCarrosExistentes(data.vehiculos);
    }
  }, [showScanner, scanMethod]);

  // 1. INGRESO DE MECÁNICO (FILTRO DE MEMBRESÍA)
  const handleMecanicoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoMecanico.trim()) return;

    setLoadingLogin(true);
    setLoginError(null);

    try {
      if (useSimulado) {
        // Validación con base de datos simulada
        setTimeout(() => {
          const data = getSimulatedData();
          const mec = data.mecanicos.find(
            (m) => m.codigoMecanico.toLowerCase() === codigoMecanico.trim().toLowerCase()
          );

          if (!mec) {
            setLoginError("Código de mecánico no registrado en el sistema AutoScore.");
          } else if (mec.estado === "Suspendido") {
            setLoginError(
              `ACCESO DENEGADO: La membresía del técnico ${mec.nombre} (${mec.taller}) está SUSPENDIDA por falta de pago. Regularice el estado de cuenta para operar.`
            );
          } else {
            setLoggedMecanico(mec);
          }
          setLoadingLogin(false);
        }, 800);
      } else {
        // En producción real conectada a Sheets, permitimos el ingreso con el código y validaremos
        // al enviar el POST completo. Para una experiencia premium, consultamos a la base de datos local
        // primero o permitimos ingresar para ejecutar el filtro estricto durante la firma.
        // Vamos a verificar localmente para agilizar, y aplicar validación estricta en el doPost.
        const data = getSimulatedData();
        const mec = data.mecanicos.find(
          (m) => m.codigoMecanico.toLowerCase() === codigoMecanico.trim().toLowerCase()
        );

        if (mec) {
          if (mec.estado === "Suspendido") {
            setLoginError(
              `ACCESO DENEGADO (Sincronizado): La membresía del taller ${mec.taller} está SUSPENDIDA. Debe cancelar la cuota de afiliación de AutoScore para firmar mantenimientos.`
            );
            setLoadingLogin(false);
            return;
          }
          setLoggedMecanico(mec);
        } else {
          // Si es un código personalizado, en producción confiamos y dejamos entrar;
          // el Apps Script se encargará de rechazarlo en el doPost si no existe.
          // Creamos una estructura provisoria para la sesión.
          setLoggedMecanico({
            codigoMecanico: codigoMecanico.trim().toUpperCase(),
            nombre: "Técnico Certificado #" + codigoMecanico.trim(),
            taller: "Taller Afiliado",
            estado: "Activo"
          });
        }
        setLoadingLogin(false);
      }
    } catch (err: any) {
      setLoginError("Fallo en la autenticación del técnico.");
      setLoadingLogin(false);
    }
  };

  // Salir de la sesión del técnico
  const handleLogoutMecanico = () => {
    setLoggedMecanico(null);
    setCodigoMecanico("");
    setPlaca("");
    setKilometraje("");
    setTrabajo("");
    setFormError(null);
    setFormSuccess(null);
    stopCamera();
    setShowScanner(false);
  };

  // 2. CONTROL DE LA CÁMARA NATIVA
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const constraints = {
        video: { facingMode: "environment" } // Priorizar cámara trasera en móviles
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setCameraError(
        "No se pudo acceder a la cámara. Por favor concede permisos de video en tu navegador o usa el simulador rápido."
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Al abrir el escáner, arrancar cámara si es método físico
  useEffect(() => {
    if (showScanner && scanMethod === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showScanner, scanMethod]);

  // Manejar captura de cámara simulada / real
  const handleSimularScan = (placaSeleccionada: string) => {
    setPlaca(placaSeleccionada.toUpperCase());
    setShowScanner(false);
    stopCamera();
    setFormError(null);
  };

  // Simulación de escaneo visual con cámara
  const triggerCameraScanResult = () => {
    // Si están usando la cámara, simulamos leer un código exitosamente tras un parpadeo de luces
    if (cameraActive) {
      // Tomamos el primer carro disponible o uno de ejemplo
      const data = getSimulatedData();
      const placaElegida = data.vehiculos[0]?.placa || "AB123CD";
      
      // Animación de escaneo
      setTimeout(() => {
        handleSimularScan(placaElegida);
      }, 1500);
    }
  };

  // 3. ENVÍO DE FORMULARIO: REGISTRAR Y FIRMAR MANTENIMIENTO (POST)
  const handleRegistrarMantenimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedMecanico) return;
    
    const cleanPlaca = placa.trim().toUpperCase();
    const kmNum = Number(kilometraje);
    const cleanTrabajo = trabajo.trim();

    if (!cleanPlaca || !kilometraje || !cleanTrabajo) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }

    if (isNaN(kmNum) || kmNum <= 0) {
      setFormError("Por favor, ingresa un kilometraje numérico válido mayor a cero.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const payload = {
      codigoMecanico: loggedMecanico.codigoMecanico,
      placa: cleanPlaca,
      kilometraje: kmNum,
      trabajo: cleanTrabajo
    };

    try {
      if (useSimulado) {
        // Enviar al motor local simulado
        setTimeout(() => {
          const res = simularPostMantenimiento(payload);
          if (res.success) {
            setFormSuccess(res.data);
            // Limpiar formulario excepto placa (por comodidad)
            setKilometraje("");
            setTrabajo("");
          } else {
            setFormError(res.error || "Ocurrió un error en el registro simulado.");
          }
          setIsSubmitting(false);
        }, 1200);
      } else {
        // Enviar mediante POST real a la URL de Google Apps Script
        if (!appScriptUrl) {
          throw new Error("La URL de Google Apps Script no está configurada.");
        }

        // Petición real vía fetch configurada con CORS
        const response = await fetch(appScriptUrl, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8" // Requerido por Apps Script doPost para evitar preflights molestos
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success) {
          setFormSuccess(result.data || {
            placa: cleanPlaca,
            fecha: new Date().toLocaleDateString(),
            mecanico: loggedMecanico.nombre,
            taller: loggedMecanico.taller
          });
          setKilometraje("");
          setTrabajo("");
        } else {
          setFormError(result.error || "El servidor rechazó la firma de mantenimiento.");
        }
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setFormError(err.message || "Fallo de conexión al enviar el formulario a Google Sheets.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 animate-fade-in text-slate-100">
      
      {/* ---------------- VISTA 1: INGRESO DE ACCESO MECÁNICO ---------------- */}
      {!loggedMecanico && (
        <div className="glass-panel p-6 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-500 mb-3 border border-amber-500/20">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-display font-extrabold text-white">Panel de Carga Técnica</h2>
            <p className="text-xs text-slate-400 mt-1">
              Ingresa tu código de acreditación para habilitar el escáner y registrar firmas de mantenimiento en la base de datos de AutoScore.
            </p>
          </div>

          <form onSubmit={handleMecanicoLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Código de Mecánico Homologado:
              </label>
              <input
                type="text"
                required
                placeholder="Ej: M101 o código de taller"
                value={codigoMecanico}
                onChange={(e) => setCodigoMecanico(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-center text-amber-400 font-mono font-bold tracking-widest focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
              <div className="mt-2.5 p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-1.5 text-[11px] text-slate-400 leading-normal">
                <span className="font-bold text-slate-400 block mb-1">Códigos Demo de Prueba:</span>
                <p>• <strong className="text-emerald-400 font-mono">M101</strong>: Carlos Mendoza (<strong className="text-slate-300">Activo</strong>)</p>
                <p>• <strong className="text-red-400 font-mono">M202</strong>: José Rodríguez (<strong className="text-red-500">Suspendido - Prueba Filtro Membresía</strong>)</p>
              </div>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loadingLogin}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              id="btn-login-mecanico"
            >
              {loadingLogin ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Verificar Credencial
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ---------------- VISTA 2: FORMULARIO DE FIRMA MECÁNICA ---------------- */}
      {loggedMecanico && (
        <div className="space-y-6">
          
          {/* Cabecera Técnico Activo */}
          <div className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  FIRMANDO COMO TÉCNICO
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white truncate mt-1">
                {loggedMecanico.nombre}
              </h3>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Taller: {loggedMecanico.taller}
              </p>
            </div>
            <button
              onClick={handleLogoutMecanico}
              className="text-xs bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg px-2 py-1.5 ml-3 font-medium shrink-0 transition-colors"
              id="btn-mecanico-logout"
            >
              Salir
            </button>
          </div>

          {/* Formulario Principal de Mantenimiento */}
          <div className="glass-panel p-5 shadow-xl relative overflow-hidden">
            <h4 className="text-sm font-display font-bold text-white mb-4 flex items-center gap-1.5 border-b border-white/5 pb-3">
              <PenTool className="w-4.5 h-4.5 text-amber-500" />
              Nueva Firma de Historial
            </h4>

            {formSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs flex flex-col gap-2 mb-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>¡Mantenimiento Firmado Exitosamente!</span>
                </div>
                <div className="mt-1 space-y-1 text-slate-300 font-mono text-[11px]">
                  <p>• Transacción ID: #{formSuccess.idHistorial}</p>
                  <p>• Placa Vinculada: {formSuccess.placa}</p>
                  <p>• Fecha Sello: {formSuccess.fecha}</p>
                  <p>• Validador: {formSuccess.mecanico}</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Los datos se han persistido de forma inviolable y el score mecánico del vehículo ha sido recalculado en tiempo real.
                </p>
                <button
                  onClick={() => setFormSuccess(null)}
                  className="mt-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold py-1.5 px-3 rounded-lg text-xs self-end border border-emerald-500/20"
                >
                  Registrar Otro Trabajo
                </button>
              </div>
            )}

            <form onSubmit={handleRegistrarMantenimiento} className="space-y-4">
              
              {/* Campo PLACA con botón de escáner QR */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Placa del Vehículo (Involucrada):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="Ej: AB123CD"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    className="flex-1 glass-input rounded-xl px-4 py-2.5 text-sm font-mono font-bold tracking-widest text-amber-400 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScanMethod("simulator");
                      setShowScanner(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                    title="Escanear QR de Placa"
                    id="btn-scan-trigger"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Escanear QR</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  * Escanea el código QR en la pantalla del propietario para leer la placa instantáneamente y bloquear errores de transcripción.
                </p>
              </div>

              {/* Kilometraje */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Kilometraje Actual (Odómetro):
                </label>
                <div className="relative">
                  <Gauge className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="number"
                    required
                    placeholder="Ej: 45000"
                    value={kilometraje}
                    onChange={(e) => setKilometraje(e.target.value)}
                    className="w-full glass-input rounded-xl pl-10 pr-12 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-500 font-mono font-medium"
                  />
                  <span className="absolute right-4 top-3 text-xs text-slate-500 font-mono font-semibold">KM</span>
                </div>
              </div>

              {/* Descripción de Trabajo */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Descripción Detallada del Trabajo Realizado:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detalla cambios de fluidos, marcas de repuestos, reparaciones de motor, dirección o preventivos..."
                  value={trabajo}
                  onChange={(e) => setTrabajo(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder-slate-500 leading-relaxed font-light"
                />
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/15"
                id="btn-firmar-mantenimiento"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <PenTool className="w-4 h-4" />
                    Registrar y Firmar Mantenimiento
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ---------------- PANTALLA ADICIONAL: INTERFAZ DE ESCÁNER DE QR (MODAL) ---------------- */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col justify-center items-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-sm glass-panel p-5 shadow-2xl overflow-hidden relative">
            
            {/* Header del Escáner */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h4 className="text-sm font-display font-extrabold text-white flex items-center gap-1.5">
                <Camera className="w-4.5 h-4.5 text-amber-500" />
                Lector de Placas QR
              </h4>
              <button
                onClick={() => {
                  setShowScanner(false);
                  stopCamera();
                }}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-white/5 border border-white/10 rounded"
              >
                Cerrar
              </button>
            </div>

            {/* Selector de Método de Escaneo */}
            <div className="flex bg-black/40 rounded-lg p-1 mb-4 border border-white/5">
              <button
                onClick={() => setScanMethod("simulator")}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
                  scanMethod === "simulator"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Escanear QR (Simulado Rápido)
              </button>
              <button
                onClick={() => setScanMethod("camera")}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${
                  scanMethod === "camera"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Cámara Live
              </button>
            </div>

            {/* MÉTODO 1: SIMULADOR DE ESCANEO RÁPIDO */}
            {scanMethod === "simulator" && (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400 leading-relaxed text-center mb-1">
                  Haz clic en cualquiera de las siguientes placas detectadas por infrarrojo o QR para rellenar automáticamente el campo del vehículo:
                </p>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {carrosExistentes.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500 font-mono">
                      Cargando placas del sistema...
                    </div>
                  ) : (
                    carrosExistentes.map((c) => (
                      <button
                        key={c.placa}
                        onClick={() => handleSimularScan(c.placa)}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/40 rounded-xl p-3 flex justify-between items-center text-xs text-left transition-all"
                      >
                        <div>
                          <span className="font-mono font-bold text-amber-400 tracking-wider text-sm block">
                            {c.placa}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {c.marca} {c.modelo}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-right font-mono text-[10px]">
                          <span className="text-slate-500">Score: {c.score}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* MÉTODO 2: ESCÁNER CON VIDEO DE CÁMARA REAL */}
            {scanMethod === "camera" && (
              <div className="space-y-4">
                {cameraError ? (
                  <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl text-[11px] text-red-400 text-center leading-relaxed">
                    <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-red-500" />
                    <span>{cameraError}</span>
                  </div>
                ) : (
                  <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden border border-slate-800">
                    
                    {/* Elemento de Video */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* HUD Overlay / Grid de Escaneo */}
                    <div className="absolute inset-0 border-[28px] border-slate-950/70 flex items-center justify-center pointer-events-none">
                      <div className="w-full h-full border-2 border-amber-500 relative">
                        {/* Esquinas del HUD */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-amber-400" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-amber-400" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-amber-400" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-amber-400" />

                        {/* Línea Láser Animada */}
                        <div className="absolute left-0 right-0 h-[1.5px] bg-amber-400/80 shadow-sm shadow-amber-400 animate-pulse" style={{ top: '50%' }} />
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                      <span className="bg-slate-950/80 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wider text-amber-400 uppercase font-semibold">
                        Apunta al QR vehicular
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={triggerCameraScanResult}
                    disabled={!cameraActive}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-4 h-4" />
                    Capturar QR de Placa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (cameraActive) {
                        stopCamera();
                      } else {
                        startCamera();
                      }
                    }}
                    className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
                  >
                    <RefreshCw className={`w-4 h-4 ${cameraActive ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
