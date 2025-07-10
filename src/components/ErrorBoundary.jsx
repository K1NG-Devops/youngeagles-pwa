import React from 'react';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Send error to logging service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to logging service
      // logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onRetry, onGoHome }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full rounded-lg shadow-lg p-6 text-center ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="mb-4">
          <FaExclamationTriangle className="mx-auto text-4xl text-red-500 mb-2" />
          <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <FaRedo className="text-sm" />
            <span>Try Again</span>
          </button>
          
          <button
            onClick={onGoHome}
            className={`w-full border px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              isDark 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaHome className="text-sm" />
            <span>Go Home</span>
          </button>
        </div>

        {/* Error details for development */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              Error Details (Development)
            </summary>
            <pre className={`text-xs p-3 rounded overflow-auto ${isDark ? 'bg-gray-900 text-red-300' : 'bg-gray-100 text-red-600'}`}>
              {error.toString()}
              {errorInfo && errorInfo.componentStack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary; 