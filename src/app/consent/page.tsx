'use client'

import { ConsentForm } from '@/domains/consent/client'

export default function ConsentPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <ConsentForm />
    </div>
  )
}
