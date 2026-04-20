import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Copy } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleCopy = () => {
    if (this.state.error) {
      const text = `${this.state.error.message}\n${this.state.error.stack}\n${JSON.stringify(this.state.errorInfo)}`;
      navigator.clipboard.writeText(text);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center p-8 font-mono">
          <div className="max-w-3xl w-full bg-zinc-900 border border-rose-900/50 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="bg-rose-950/20 border-b border-rose-900/30 p-8 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/30">
                <AlertTriangle className="text-rose-500" size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-rose-500">System Failure</h2>
                <p className="text-[10px] font-bold text-rose-500/60 uppercase tracking-[0.3em] mt-1">Render engine compromised / invalid child node</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-black/50 rounded-xl p-6 border border-zinc-800 overflow-x-auto max-h-[300px]">
                <p className="text-rose-400 font-bold mb-2 uppercase text-[10px] tracking-widest bg-rose-400/10 px-2 py-1 rounded inline-block">Error Trace</p>
                <div className="text-zinc-300 text-xs leading-relaxed">
                  <span className="text-white font-bold">{this.state.error?.name}:</span> {this.state.error?.message}
                  <pre className="mt-4 text-[10px] text-zinc-500 whitespace-pre-wrap">
                    {this.state.error?.stack}
                  </pre>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-3 px-8 py-4 bg-zinc-100 text-zinc-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
                >
                  <RefreshCcw size={14} /> Reinitialize System
                </button>
                <button
                  onClick={this.handleCopy}
                  className="flex items-center gap-3 px-8 py-4 bg-zinc-800 text-zinc-100 rounded-xl font-black uppercase tracking-widest text-xs border border-zinc-700 hover:bg-zinc-700 transition-all"
                >
                  <Copy size={14} /> Copy Crash Dump
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
