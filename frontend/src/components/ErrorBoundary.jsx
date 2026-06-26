import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
          <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 p-8 md:p-12 rounded-2xl text-center max-w-lg mx-auto space-y-6">
            <span className="text-5xl">⚠️</span>
            <h3 className="text-slate-900 font-extrabold text-2xl tracking-tight">Something went wrong.</h3>
            <p className="text-slate-600 text-sm max-w-sm mx-auto">
              An unexpected error occurred in the application. Please try reloading the page.
            </p>
            <div className="pt-4 flex flex-col gap-3 sm:flex-row justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition shadow-sm shadow-indigo-600/20"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:text-slate-900 transition"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
