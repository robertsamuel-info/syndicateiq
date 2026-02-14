import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

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
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-primary-navy">
          <Card className="max-w-2xl w-full">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-semantic-danger/20 rounded-full">
                  <AlertTriangle className="h-12 w-12 text-semantic-danger" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                <p className="text-gray-400 mb-4">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                {this.state.error && (
                  <details className="text-left bg-gray-800 p-4 rounded-lg mt-4">
                    <summary className="text-sm text-gray-400 cursor-pointer mb-2">
                      Error details
                    </summary>
                    <pre className="text-xs text-gray-500 overflow-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
              <div className="flex gap-4 justify-center">
                <Button variant="default" onClick={this.handleReset}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
