'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/shared/components/ui'
import { useTranslations } from 'next-intl'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

function ErrorFallback({
  message,
  onRetry,
}: {
  message?: string
  onRetry: () => void
}) {
  const t = useTranslations('common')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">{t('error')}</h1>
      <p className="text-gray-600 text-center mb-6">{message || t('error')}</p>
      <Button onClick={onRetry}>{t('retry')}</Button>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          message={this.state.error?.message}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}
