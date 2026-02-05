'use client'

import { Button } from '@/shared/components/ui'

export function NotInstalledScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">World App Required</h1>
      <p className="text-gray-600 text-center mb-6">
        This app requires World App to function.
      </p>
      <Button
        onClick={() => window.open('https://worldcoin.org/download', '_blank')}
      >
        Download World App
      </Button>
    </div>
  )
}
