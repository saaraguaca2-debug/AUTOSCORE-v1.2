import React, { useState, useEffect } from "react";
import { Database, Wifi, WifiOff, Settings, Check, HelpCircle } from "lucide-react";

interface BaseDatosToggleProps {
  useSimulado: boolean;
  setUseSimulado: (val: boolean) => void;
  appScriptUrl: string;
  setAppScriptUrl: (url: string) => void;
}

export default function BaseDatosToggle({
  useSimulado,
  setUseSimulado,
  appScriptUrl,
  setAppScriptUrl,
}: BaseDatosToggleProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [inputUrl, setInputUrl] = useState(appScriptUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setInputUrl(appScriptUrl);
  }, [appScriptUrl]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAppScriptUrl(inputUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="w-full bg-slate-950/40 backdrop-blur-md border-b border-white/5 py-2.5 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Logo de la barra */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-display font-bold text-sm tracking-wider text-slate-200">
            AUTOSCORE <span className="text-amber-500 text-xs font-mono font-normal">v1.2</span>
          </span>
        </div>

        {/* Controles de conexión */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-sm">
            <button
              onClick={() => setUseSimulado(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                useSimulado
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="btn-simulado"
            >
              <Database className="w-3.5 h-3.5" />
              Simulador
            </button>
            <button
              onClick={() => {
                setUseSimulado(false);
                if (!appScriptUrl) {
                  setShowSettings(true);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                !useSimulado
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="btn-live"
            >
              {appScriptUrl ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-slate-500" />
              )}
              Sheets Live
            </button>
          </div>

          {/* Botón de configuración */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors ${
              showSettings ? "text-amber-400 border-amber-500/30 bg-amber-500/5" : ""
            }`}
            title="Configurar URL del Google Apps Script"
            id="btn-toggle-settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panel Desplegable de Configuración de la API */}
      {showSettings && (
        <div className="max-w-4xl mx-auto mt-3 p-4 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-3 duration-300">
          <h3 className="text-sm font-display font-semibold text-slate-200 mb-1 flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-500" />
            Configuración de Google Apps Script (Producción)
          </h3>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Para conectar esta interfaz web a tu propia base de datos en Google Sheets, pega aquí la URL generada al publicar tu Apps Script como Aplicación Web (con acceso configurado para "Cualquier persona").
          </p>

          <form onSubmit={handleSave} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="url"
                required
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder-slate-600 font-mono"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1 shrink-0"
                id="btn-save-settings"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                {saveSuccess ? "Guardado" : "Guardar URL"}
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>
                ¿No tienes tu URL lista? Usa el <strong>Modo Simulador Local</strong> para experimentar el 100% de la lógica sin configuraciones.
              </span>
            </div>
          </form>

          {appScriptUrl && (
            <div className="mt-2.5 p-2 bg-emerald-950/20 border border-emerald-900/30 rounded-lg flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-mono truncate max-w-xs sm:max-w-lg">
                Conectado a: {appScriptUrl}
              </span>
              <button
                onClick={() => {
                  setAppScriptUrl("");
                  setInputUrl("");
                  setUseSimulado(true);
                }}
                className="text-[10px] text-red-400 hover:text-red-300 font-medium underline px-1.5 py-0.5 rounded transition-colors"
              >
                Desconectar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
