import { Button } from '@renderer/components/ui/button';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  readonly children: ReactNode;
};

type State = {
  readonly error: Error | null;
};

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[GlobalErrorBoundary]', error, info.componentStack);
  }

  private handleReload = (): void => {
    this.setState({ error: null });
    window.location.hash = '#/';
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center"
          role="alert"
          aria-live="assertive"
        >
          <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
          <p className="max-w-md text-muted-foreground text-sm">
            The UI hit an unexpected error. You can try reloading the window. If this persists,
            contact support.
          </p>
          <p className="font-mono text-muted-foreground text-xs">{this.state.error.message}</p>
          <Button type="button" onClick={this.handleReload}>
            Reload app
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
