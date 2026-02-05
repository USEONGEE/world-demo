'use client'

import { useTranslations } from 'next-intl'
import { Card } from '@/shared/components/ui'

export function DeveloperContact() {
  const t = useTranslations('settings')
  const email = process.env.NEXT_PUBLIC_DEVELOPER_EMAIL
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL

  return (
    <Card>
      <h3 className="font-semibold mb-4">{t('contact')}</h3>
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
        <p className="text-gray-500">{t('noContact')}</p>
      )}
    </Card>
  )
}
