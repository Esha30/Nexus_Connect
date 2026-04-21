import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6">
          <div className="fixed inset-0 pointer-events-none opacity-40">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-100 blur-[120px]" />
          </div>
          
          <div className="max-w-md w-full glass-surface p-8 rounded-2xl border border-red-100 shadow-xl relative z-10 text-center animate-fade-in">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              We've encountered an unexpected error. Our team has been notified, and we're working to fix it.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Error Trace</p>
              <p className="text-xs font-mono text-gray-600 break-all leading-tight">
                {this.state.error?.message || 'Unknown runtime error occurred in component tree.'}
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                fullWidth 
                leftIcon={<RefreshCw size={18} />} 
                onClick={() => window.location.reload()}
              >
                Try To Reload
              </Button>
              <Button 
                fullWidth 
                variant="outline" 
                leftIcon={<Home size={18} />} 
                onClick={this.handleReset}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
