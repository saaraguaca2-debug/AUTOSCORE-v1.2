import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    localStorage.removeItem("autoscore_appscript_url");
    localStorage.setItem("autoscore_use_simulado", "true");
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-slate-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-6 shadow-2xl relative text-center">
            <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-400 mb-4 border border-red-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-display font-extrabold text-white">¡Ups! Algo salió mal</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              La aplicación detectó un error al procesar los datos de tu Google Sheets o de tu sesión actual.
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-left font-mono text-[11px] text-red-400 overflow-auto max-h-40">
                <strong>Error:</strong> {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="mt-6 w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Restablecer y Usar Simulador
            </button>
            <p className="text-[10px] text-slate-500 mt-3">
              Esto desconectará temporalmente la URL para que puedas reingresar con seguridad.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
