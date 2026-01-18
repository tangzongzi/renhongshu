import { Component, ErrorInfo, ReactNode } from 'react'
import { Logger } from '../utils/logger'
import { ErrorHandler } from '../utils/errorHandler'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误
    const appError = ErrorHandler.handleUnknownError(error)
    ErrorHandler.logError(appError)
    Logger.error('React组件错误', {
      error: error.message,
      componentStack: errorInfo.componentStack,
      trackingId: appError.trackingId,
    })

    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-3">
              出错了
            </h2>

            <p className="text-gray-600 mb-6">
              应用遇到了一个错误，请刷新页面重试
            </p>

            {typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-2xl text-left">
                <p className="text-xs text-gray-700 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              返回首页
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
