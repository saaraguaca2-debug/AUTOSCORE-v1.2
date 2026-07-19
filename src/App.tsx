/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Shield, Car, PenTool, BookOpen, ChevronRight, Home, Info, HelpCircle, AlertCircle, Sparkles, Check
} from "lucide-react";
import { VistaActual } from "./types";
import { inicializarBaseDatosSimulada } from "./mockData";
import BaseDatosToggle from "./components/BaseDatosToggle";
import InicioView from "./components/InicioView";
import UsuarioView from "./components/UsuarioView";
import MecanicoView from "./components/MecanicoView";
import SoporteView from "./components/SoporteView";

export default function App() {
  // Inicializar base de datos de simulación al montar la aplicación
  useEffect(() => {
    inicializarBaseDatosSimulada();
  }, []);

  // Detectar URL predeterminada del Apps Script desde variables de entorno
  const defaultUrl = (
    (import.meta as any).env?.VITE_APPSCRIPT_URL || 
    (import.meta as any).env?.NEXT_PUBLIC_APPSCRIPT_URL || 
    ""
  );

  // Estados globales de conexión y persistencia
  const [useSimulado, setUseSimulado] = useState<boolean>(() => {
    const saved = localStorage.getItem("autoscore_use_simulado");
    return saved ? saved === "true" : true; // Por defecto usar simulador para evitar bloqueos iniciales
  });

  const [appScriptUrl, setAppScriptUrl] = useState<string>(() => {
    const saved = localStorage.getItem("autoscore_appscript_url");
    return saved || defaultUrl;
  });

  // Guardar configuraciones en localStorage para persistencia
  useEffect(() => {
    localStorage.setItem("autoscore_use_simulado", String(useSimulado));
  }, [useSimulado]);

  useEffect(() => {
    localStorage.setItem("autoscore_appscript_url", appScriptUrl);
  }, [appScriptUrl]);

  // Enrutamiento mediante Estado de React (Instantáneo y óptimo para móviles)
  const [currentView, setCurrentView] = useState<VistaActual>("home");

  // Función para transicionar vistas suavemente
  const navegarA = (vista: VistaActual) => {
    setCurrentView(vista);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* 1. Header con Toggle de Base de Datos (Simulador / Live Google Sheets) */}
      <div className="no-print">
        <BaseDatosToggle
          useSimulado={useSimulado}
          setUseSimulado={setUseSimulado}
          appScriptUrl={appScriptUrl}
          setAppScriptUrl={setAppScriptUrl}
        />
      </div>

      {/* 2. Banner de Estado Activo de la API */}
      {!useSimulado && !appScriptUrl && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 text-center no-print">
          <div className="max-w-md mx-auto flex items-center justify-center gap-2 text-xs text-amber-400 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Configura tu URL de Google Sheets en la esquina superior derecha ⚙️ para usar el modo Live.</span>
          </div>
        </div>
      )}

      {/* 3. Contenedor Principal con chasis estilo iPhone/Smartphone en Desktop */}
      <main className="flex-1 flex flex-col justify-start items-center w-full max-w-7xl mx-auto py-4 px-2 sm:px-4 mb-20">
        
        {/* Chasis de Dispositivo Móvil en Pantallas Grandes para emulación real */}
        <div className="w-full max-w-md bg-slate-950/20 backdrop-blur-md sm:border sm:border-white/10 sm:rounded-[36px] sm:shadow-2xl overflow-hidden min-h-[720px] flex flex-col relative sm:ring-1 sm:ring-white/5 sm:glow-silver/10 print:max-w-full print:border-none print:shadow-none print:bg-transparent">
          
          {/* Cámara Notch simulado para estética smartphone premium */}
          <div className="hidden sm:flex justify-center w-full pt-3 pb-1 bg-black/40 border-b border-white/5 no-print">
            <div className="w-28 h-4 rounded-full bg-slate-950 border border-slate-800/80 flex items-center justify-between px-3">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              <div className="w-8 h-1 rounded-full bg-slate-900" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30" />
            </div>
          </div>

          {/* Vistas dinámicas */}
          <div className="flex-1 flex flex-col py-2">
            {(() => {
              switch (currentView) {
                case "home":
                  return <InicioView onNavigate={navegarA} useSimulado={useSimulado} />;
                case "usuario":
                  return <UsuarioView useSimulado={useSimulado} appScriptUrl={appScriptUrl} />;
                case "mecanico":
                  return <MecanicoView useSimulado={useSimulado} appScriptUrl={appScriptUrl} />;
                case "documentacion":
                  return <SoporteView onNavigate={navegarA} />;
                default:
                  return null;
              }
            })()}
          </div>

        </div>
      </main>

      {/* 4. Barra de Navegación de Control de Tacto Inferior (Dock Flotante) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/70 backdrop-blur-lg border border-white/10 py-2.5 px-6 rounded-2xl shadow-2xl flex items-center gap-7 z-40 animate-fade-in max-w-sm ring-1 ring-white/5 no-print">
        
        <button
          onClick={() => navegarA("home")}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentView === "home" ? "text-amber-500 scale-105 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
          id="dock-btn-home"
        >
          <Home className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px]">Inicio</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-800" />

        <button
          onClick={() => navegarA("usuario")}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentView === "usuario" ? "text-amber-500 scale-105 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
          id="dock-btn-usuario"
        >
          <Car className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px]">Garage</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-800" />

        <button
          onClick={() => navegarA("mecanico")}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentView === "mecanico" ? "text-amber-500 scale-105 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
          id="dock-btn-mecanico"
        >
          <PenTool className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px]">Técnico</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-800" />

        <button
          onClick={() => navegarA("documentacion")}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentView === "documentacion" ? "text-amber-500 scale-105 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
          id="dock-btn-soporte"
        >
          <BookOpen className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px]">Guías</span>
        </button>

      </div>

    </div>
  );
}
