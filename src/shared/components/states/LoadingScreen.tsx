'use client'

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  )
}
