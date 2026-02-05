'use client'

import { Button } from '@/shared/components/ui'

export function OfflineScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">No Connection</h1>
      <p className="text-gray-600 text-center mb-6">
        Please check your internet connection and try again.
      </p>
      <Button onClick={() => window.location.reload()}>Retry</Button>
    </div>
  )
}
