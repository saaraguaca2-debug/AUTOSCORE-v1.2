import React, { useState } from "react";
import { FolderTree, Copy, Check, ChevronLeft, HelpCircle, FileCode, Server } from "lucide-react";
import { VistaActual } from "../types";

interface SoporteViewProps {
  onNavigate: (vista: VistaActual) => void;
}

export default function SoporteView({ onNavigate }: SoporteViewProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const folderStructure = `📂 mi-proyecto-autoscore/
├── 📄 .env.local                  <-- Variable NEXT_PUBLIC_APPSCRIPT_URL
├── 📂 app/
│   ├── 📄 layout.js               <-- Configuración del HTML base y fuentes
│   ├── 📄 page.js                 <-- Pantalla de Bienvenida (Inicio)
│   ├── 📂 usuario/
│   │   └── 📄 page.js             <-- Portal de Propietario (Garaje, Certificados y QR)
│   └── 📂 mecanico/
│       └── 📄 page.js             <-- Portal de Técnico (Escanear QR y Firmar)
└── 📄 package.json`;

  const envContent = `NEXT_PUBLIC_APPSCRIPT_URL="https://script.google.com/macros/s/TU_SCRIPT_ID/exec"`;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 animate-fade-in text-slate-300">
      {/* Botón de regreso */}
      <button
        onClick={() => onNavigate("home")}
        className="mb-6 flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-semibold uppercase tracking-wider"
        id="btn-soporte-back"
      >
        <ChevronLeft className="w-4 h-4" />
        Regresar al Inicio
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-display font-extrabold text-white flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-amber-500" />
          Estructura de Archivos Next.js
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Guía de ubicación exacta y organización de carpetas para tu despliegue definitivo en Vercel (Next.js App Router).
        </p>
      </div>

      {/* Estructura en Árbol */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 font-mono text-xs text-slate-300 backdrop-blur-sm">
        <span className="block text-[11px] uppercase text-slate-500 font-bold mb-2">
          Estructura de Carpetas Sugerida (Next.js):
        </span>
        <pre className="overflow-x-auto whitespace-pre leading-relaxed text-amber-100/95">{folderStructure}</pre>
      </div>

      {/* Detalle de Archivos Solicitados */}
      <div className="space-y-6">
        {/* 1. .env.local */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] bg-slate-850 text-slate-400 font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-800">
                PASO 1
              </span>
              <h3 className="text-sm font-semibold text-white font-display mt-1.5">
                Archivo de Configuración: <code className="text-amber-400 font-mono">.env.local</code>
              </h3>
            </div>
            <button
              onClick={() => copyText("env", envContent)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              id="btn-copy-env"
            >
              {copied === "env" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Ubícalo en la <strong>raíz de tu proyecto Next.js</strong> para que las peticiones se realicen a tu backend sin exponer credenciales directamente en los repositorios.
          </p>
          <pre className="bg-black/40 p-3 rounded-lg text-xs font-mono text-amber-400 overflow-x-auto border border-white/5">
            {envContent}
          </pre>
        </div>

        {/* 2. Google Sheets Tab Setup */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-white font-display flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-amber-500" />
            Configuración en Google Sheets (Base de Datos)
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Crea una hoja de cálculo nueva en Google Drive y añade exactamente las siguientes tres pestañas con sus respectivos nombres y columnas en la primera fila:
          </p>

          <div className="space-y-3 font-mono text-[11px]">
            <div className="p-2.5 bg-black/30 border border-white/5 rounded-xl">
              <span className="font-bold text-amber-400 block mb-1">Pestaña 1: "Mecanicos"</span>
              <span className="text-slate-400">Columnas: </span>
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">CodigoMecanico</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">Nombre</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">Taller</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">Estado</code>
            </div>

            <div className="p-2.5 bg-black/30 border border-white/5 rounded-xl">
              <span className="font-bold text-amber-400 block mb-1">Pestaña 2: "Vehiculos"</span>
              <span className="text-slate-400">Columnas: </span>
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">Placa</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">Marca</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">Modelo</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">Anio</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">IdDueno</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">Score</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">EstadoCertificado</code>
            </div>

            <div className="p-2.5 bg-black/30 border border-white/5 rounded-xl">
              <span className="font-bold text-amber-400 block mb-1">Pestaña 3: "Historial"</span>
              <span className="text-slate-400">Columnas: </span>
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">IdHistorial</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">Placa</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">Fecha</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">Kilometraje</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">CodigoMecanico</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">Taller</code>,{" "}
              <code className="text-white bg-black/40 px-1 py-0.5 rounded border border-white/5">TrabajoRealizado</code>
            </div>
          </div>
        </div>

        {/* 3. Instrucción de Apps Script */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-white font-display flex items-center gap-2 mb-2">
            <FileCode className="w-4 h-4 text-amber-500" />
            ¿Dónde colocar el archivo google-apps-script.js?
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400 leading-relaxed">
            <li>
              Abre tu Google Sheets y presiona <strong>Extensiones &gt; Apps Script</strong>.
            </li>
            <li>
              Borra el código que venga por defecto en el archivo <code className="text-white bg-slate-900 px-1 py-0.5 rounded">Código.gs</code>.
            </li>
            <li>
              Copia íntegramente el contenido de nuestro archivo <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded font-mono">google-apps-script.js</code> (creado en la raíz de este proyecto) y pégalo allí.
            </li>
            <li>
              Haz clic en el botón de <strong>Implementar (Deploy) &gt; Nueva implementación</strong>.
            </li>
            <li>
              Selecciona tipo: <strong>Aplicación web</strong>.
            </li>
            <li>
              Configura: Ejecutar como: <strong>Tú</strong>, Quién tiene acceso: <strong>Cualquier persona (Anyone)</strong>. Esto es indispensable para evitar bloqueos CORS.
            </li>
            <li>
              Presiona implementar, autoriza los permisos requeridos de Sheets con tu cuenta de Google y copia la <strong>URL de la aplicación web</strong> proporcionada.
            </li>
            <li>
              ¡Pega esa URL en el panel superior de esta aplicación para habilitar el modo producción!
            </li>
          </ol>
        </div>
      </div>

      <div className="mt-8 mb-4 text-center">
        <button
          onClick={() => onNavigate("home")}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs transition-colors"
          id="btn-soporte-entendido"
        >
          Entendido, ¡Ir al Sistema AutoScore!
        </button>
      </div>
    </div>
  );
}
