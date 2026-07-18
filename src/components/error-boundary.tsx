"use client";

import * as React from "react";

interface State {
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Top-level error boundary. Catches uncaught throws in client components and
 * renders a fallback instead of blanking the whole tree.
 *
 * Next.js App Router uses error.tsx files at the route level for production
 * error UIs; this is a belt-and-braces global net for client islands that
 * don't have their own error boundary.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
          <div className="max-w-md rounded-2xl border border-border bg-background p-8 shadow-[inset_4px_4px_8px_rgba(150,130,100,0.28),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]">
            <h1 className="text-2xl font-semibold tracking-tight">Something broke.</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              An unexpected error occurred. Reload the page, or contact support if it keeps happening.
            </p>
            <pre className="mt-4 max-h-40 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:brightness-95"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}