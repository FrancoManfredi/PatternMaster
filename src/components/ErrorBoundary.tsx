"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-surface-container border border-error/20 p-8 text-center">
            <span className="material-symbols-outlined text-error text-4xl mb-4 block">
              error
            </span>
            <h3 className="font-headline text-headline-sm text-on-surface mb-2">
              Algo salió mal
            </h3>
            <p className="font-body text-body-md text-on-surface-variant">
              Ha ocurrido un error inesperado. Intenta recargar la página.
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
