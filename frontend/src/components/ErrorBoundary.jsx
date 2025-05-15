import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="p-4 border-2 border-red-500 bg-red-50 text-red-700 font-mono my-4">
          <h1>Something went wrong.</h1>
          <p>Please try refreshing the page or contact support if the issue persists.</p>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
