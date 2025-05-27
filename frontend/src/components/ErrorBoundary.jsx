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
        <div className="p-6 border-2 border-black bg-white text-black font-mono my-4 rounded-none shadow-omori-default text-center">
          <h1 className="text-2xl font-bold mb-3">SOMETHING WENT WRONG.</h1>
          <p className="mb-2">An unexpected error has occurred.</p>
          <p>Please try refreshing the page.</p>
          {/* You could add a sad ASCII face or a simple pixel art error icon here if desired */}
          {/* For example: <pre className="mt-3 text-lg">(╥_╥)</pre> */}
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
