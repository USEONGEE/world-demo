'use client'

import { Card } from '@/shared/components/ui'

export function DeveloperContact() {
  const email = process.env.NEXT_PUBLIC_DEVELOPER_EMAIL
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL

  return (
    <Card>
      <h3 className="font-semibold mb-4">Developer Contact</h3>
      {email && (
        <a href={`mailto:${email}`} className="block text-blue-600 mb-2">
          {email}
        </a>
      )}
      {supportUrl && (
        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-blue-600"
        >
          Support Website
        </a>
      )}
      {!email && !supportUrl && (
        <p className="text-gray-500">No contact information available</p>
      )}
    </Card>
  )
}
