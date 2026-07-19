import React from "react";
import { Shield, Car, PenTool, BookOpen, Clock, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { VistaActual } from "../types";

interface InicioViewProps {
  onNavigate: (vista: VistaActual) => void;
  useSimulado: boolean;
}

export default function InicioView({ onNavigate, useSimulado }: InicioViewProps) {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center">
      {/* Cabecera Principal - Logo Premium */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 mb-4 border border-amber-300/30">
          <Shield className="w-9 h-9 text-slate-950 stroke-[1.8]" />
        </div>
        <h1 className="text-4xl font-display font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <span>AUTOSCORE</span>
        </h1>
        <p className="text-xs font-mono text-amber-500 mt-1.5 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
          Historial Verificado de Vehículos
        </p>
      </div>

      {/* Tarjeta de estado de conectividad venezolana */}
      <div className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3.5 mb-6 text-center shadow-md">
        <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-medium">
          <Zap className="w-4 h-4 fill-amber-400/20" />
          <span>Optimizado para conexiones móviles lentas (2G/3G)</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
          Peso mínimo de datos, compresión inteligente y {useSimulado ? "Modo Simulador Local instantáneo." : "conexión directa sin intermediarios."}
        </p>
      </div>

      {/* Botones de acción principales (Estilo VIP) */}
      <div className="w-full flex flex-col gap-4 mb-8">
        <button
          onClick={() => onNavigate("usuario")}
          className="w-full group bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold py-4 px-6 rounded-2xl shadow-xl hover:shadow-amber-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-between"
          id="btn-portal-usuario"
        >
          <div className="flex items-center gap-3.5 text-left">
            <div className="p-2 rounded-xl bg-slate-950/20">
              <Car className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <span className="block text-base font-extrabold leading-tight">Soy Propietario</span>
              <span className="block text-[11px] font-normal opacity-90">Mi Garaje Virtual, QR y Certificados</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => onNavigate("mecanico")}
          className="w-full group bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-6 rounded-2xl border border-white/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-between shadow-lg backdrop-blur-sm"
          id="btn-portal-mecanico"
        >
          <div className="flex items-center gap-3.5 text-left">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <PenTool className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <span className="block text-base font-extrabold leading-tight">Soy Técnico / Taller</span>
              <span className="block text-[11px] font-normal text-slate-400">Registrar mantenimientos con firma</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Sección Informativa: Las dos modalidades de Certificado */}
      <div className="w-full bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-inner backdrop-blur-md ring-1 ring-white/5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">
          Tecnología AutoScore VIP
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-slate-300 font-mono text-[10px] font-bold border border-slate-700">
              S
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200 font-display">Certificado Simple (Plateado)</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Muestra la puntuación de confianza (Score de 0-100) y datos básicos homologados. Mantiene la privacidad del historial ante consultas rápidas.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-500 font-mono text-[10px] font-bold border border-amber-500/30">
              C
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-400 font-display">Certificado Completo (Dorado VIP)</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Desglosa detalladamente la línea de tiempo de reparaciones, kilometraje estricto e historial certificado con talleres y mecánicos auditados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón secundario para ver documentación e instrucciones de carpetas Next.js */}
      <button
        onClick={() => onNavigate("documentacion")}
        className="mt-8 flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors font-medium py-2 px-4 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
        id="btn-ver-estructura"
      >
        <BookOpen className="w-4 h-4" />
        Ver estructura de archivos Next.js y Apps Script
      </button>

      {/* Pie de página humilde */}
      <div className="mt-12 text-center">
        <p className="text-[10px] text-slate-600 font-mono">
          AutoScore Venezuela © {new Date().getFullYear()}
        </p>
        <p className="text-[9px] text-slate-700 font-mono mt-0.5">
          Infraestructura serverless con costo de operación de $0 USD
        </p>
      </div>
    </div>
  );
}
