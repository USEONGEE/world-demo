'use client'

import { useTranslations } from 'next-intl'
import { VerifyButton } from '@/domains/human/client'

export default function HomePage() {
  const t = useTranslations('home')

  return (
    <div className="py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{t('welcome')}</h1>
        <p className="text-gray-600">{t('description')}</p>
      </div>
      <VerifyButton />
    </div>
  )
}
