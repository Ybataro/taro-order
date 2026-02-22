import { Component, type ReactNode } from 'react';
import ErrorFallback from '../customer/components/ErrorFallback';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          onReset={() => {
            this.setState({ hasError: false });
            window.location.href = '/';
          }}
        />
      );
    }
    return this.props.children;
  }
}
