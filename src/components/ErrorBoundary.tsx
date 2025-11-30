import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and display errors gracefully.
 * Particularly useful for catching shader compilation errors and WebGL issues.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            padding: '20px',
            fontFamily: 'monospace',
          }}
        >
          <div
            style={{
              maxWidth: '800px',
              backgroundColor: '#2a2a2a',
              padding: '30px',
              borderRadius: '8px',
              border: '2px solid #ff4444',
            }}
          >
            <h1 style={{ color: '#ff4444', marginTop: 0 }}>
              ⚠️ Une erreur est survenue
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.5' }}>
              Le rendu du shader a rencontré un problème. Cela peut être dû à :
            </p>
            <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <li>Une erreur de compilation du shader GLSL</li>
              <li>Un problème de contexte WebGL</li>
              <li>Des uniforms invalides ou manquants</li>
            </ul>

            {this.state.error && (
              <details style={{ marginTop: '20px' }}>
                <summary
                  style={{
                    cursor: 'pointer',
                    padding: '10px',
                    backgroundColor: '#333',
                    borderRadius: '4px',
                    marginBottom: '10px',
                  }}
                >
                  Détails de l'erreur
                </summary>
                <pre
                  style={{
                    backgroundColor: '#1a1a1a',
                    padding: '15px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '300px',
                    fontSize: '12px',
                  }}
                >
                  <strong>Message :</strong> {this.state.error.message}
                  {'\n\n'}
                  <strong>Stack :</strong>
                  {'\n'}
                  {this.state.error.stack}
                  {this.state.errorInfo && (
                    <>
                      {'\n\n'}
                      <strong>Component Stack :</strong>
                      {'\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#45a049';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#4CAF50';
              }}
            >
              🔄 Réessayer
            </button>

            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                marginLeft: '10px',
                padding: '12px 24px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1976D2';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#2196F3';
              }}
            >
              🔃 Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
