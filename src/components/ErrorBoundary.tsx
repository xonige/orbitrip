
import React, { ErrorInfo, ReactNode } from 'react';
import { Language } from '../types';

interface Props {
  children?: ReactNode;
  language?: Language;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Standard React Error Boundary.
 * Catches runtime UI errors to prevent complete app crash.
 */
class ErrorBoundary extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Standard error logging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // Cast to any to avoid "Property 'props' does not exist" error
      const isEn = ((this as any).props.language || Language.EN) === Language.EN;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 font-sans text-center text-white">
            <div className="bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl max-w-md border border-slate-700 animate-fadeIn">
                <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-black mb-3 tracking-tight">
                    {isEn ? "Interface Conflict" : "Конфликт интерфейса"}
                </h1>
                <p className="text-slate-400 mb-10 text-sm leading-relaxed font-medium">
                    {isEn 
                     ? "An internal component error occurred. A simple refresh should fix this." 
                     : "Произошла ошибка компонента. Простое обновление должно это исправить."}
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-[var(--primary)] hover:bg-[#00a844] text-white py-4 rounded-2xl font-black shadow-lg transition transform active:scale-95 uppercase tracking-widest text-xs"
                >
                    {isEn ? "Refresh Application" : "Обновить приложение"}
                </button>
                <details className="mt-6 text-left text-[10px] text-slate-500 cursor-pointer">
                    <summary className="hover:text-slate-400 font-bold uppercase tracking-widest text-center py-2">Technical Info</summary>
                    <pre className="mt-2 p-4 bg-black/50 text-red-400 rounded-xl overflow-x-auto font-mono">
                        {this.state.error?.toString()}
                    </pre>
                </details>
            </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
